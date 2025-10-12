using System;
using System.IO;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using ECom.Api.Models;
using ECom.Api.Services;
using ECom.Api.Auth;
using FirebaseAdmin;
using FirebaseAdmin.Auth;
using Google.Apis.Auth.OAuth2;
using Google.Cloud.Firestore;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

/* ---------- MVC / Controllers ---------- */
builder.Services.AddControllers();

/* ---------- Domain Services (In-Memory) ---------- */
builder.Services.AddSingleton<IProductStore, InMemoryProductStore>();
builder.Services.AddSingleton<ICartService, InMemoryCartService>();
builder.Services.AddSingleton<IOrderService, InMemoryOrderService>();
builder.Services.AddSingleton<IPaymentService, FakePaymentService>();

/* ---------- Firebase Admin & Firestore ---------- */
var projectId = builder.Configuration["Firebase:ProjectId"]
    ?? throw new Exception("Firebase:ProjectId eksik.");

var credPath =
    Environment.GetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS")
 ?? Environment.GetEnvironmentVariable("FIREBASE_CONFIG_PATH");

if (string.IsNullOrWhiteSpace(credPath) || !File.Exists(credPath))
    throw new Exception($"Service account JSON bulunamadı veya yol geçersiz: {credPath ?? "<null>"}");

var adc = GoogleCredential.GetApplicationDefault();

if (FirebaseApp.DefaultInstance == null)
{
    FirebaseApp.Create(new AppOptions { Credential = adc });
}

/* ---------- Auth ---------- */
builder.Services.AddAuthentication("Firebase")
    .AddScheme<AuthenticationSchemeOptions, FirebaseAuthenticationHandler>("Firebase", _ => {});

// Role policy’lerini Role claim’ine bağlı tutmak yerine esnek yapıyoruz
builder.Services.AddAuthorization(opts =>
{
    opts.AddPolicy("ProductsWrite", p => p.RequireAssertion(ctx =>
        ctx.User.IsInRole("Admin") || ctx.User.IsInRole("Staff")));
    opts.AddPolicy("OrdersManage", p => p.RequireAssertion(ctx =>
        ctx.User.IsInRole("Admin") || ctx.User.IsInRole("Staff")));
    opts.AddPolicy("CartCheckout", p => p.RequireAssertion(ctx =>
        ctx.User.IsInRole("Customer") || ctx.User.IsInRole("Admin") || ctx.User.IsInRole("Staff")));
});

/* ---------- Firestore DI ---------- */
builder.Services.AddSingleton(_ =>
    new FirestoreDbBuilder { ProjectId = projectId, Credential = adc }.Build());

/* ---------- CORS ---------- */
var allowedFromConfig = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();
var corsOrigins = allowedFromConfig.Concat(new[] { "http://localhost:3000" }).Distinct().ToArray();

builder.Services.AddCors(opt =>
{
    opt.AddPolicy("frontend", p => p
        .WithOrigins(corsOrigins)
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials());
});

/* ---------- Swagger ---------- */
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "ECom.Api", Version = "v1" });

    var bearerScheme = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "JWT Bearer token"
    };
    // Tanım
    c.AddSecurityDefinition("Bearer", bearerScheme);

    // **Doğru referans ile** global gereksinim
    c.AddSecurityRequirement(new OpenApiSecurityRequirement {
        {
            new OpenApiSecurityScheme {
                Reference = new OpenApiReference {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

/* ---------- Admin bootstrap (ENV: ADMIN_EMAIL) ---------- */
var adminEmail = Environment.GetEnvironmentVariable("ADMIN_EMAIL");
if (!string.IsNullOrWhiteSpace(adminEmail))
{
    try
    {
        var user = await FirebaseAuth.DefaultInstance.GetUserByEmailAsync(adminEmail);
        var dict = (user.CustomClaims ?? new Dictionary<string, object>()).ToDictionary(k => k.Key, v => v.Value);
        // Tekil role:
        dict["role"] = "Admin";
        // Alternatif dizi:
        // dict["roles"] = new[] { "Admin" };

        await FirebaseAuth.DefaultInstance.SetCustomUserClaimsAsync(user.Uid, dict);
        Console.WriteLine($"[BOOTSTRAP] {adminEmail} → Admin atandı");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[BOOTSTRAP] Hata: {ex.Message}");
    }
}

/* ---------- Pipeline ---------- */
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "ECom API v1");
        c.RoutePrefix = "swagger";
    });
    app.MapGet("/", () => Results.Redirect("/swagger"));
}

app.UseRouting();
app.UseCors("frontend");
app.UseAuthentication();   // ÖNEMLİ: Swagger Authorization header’ını burada işler
app.UseAuthorization();

app.MapControllers();

/* ---------- Helpers: Token doğrulama ve rol kontrolü ---------- */
static string? ExtractBearer(Microsoft.Extensions.Primitives.StringValues header)
    => header.Count == 0 ? null :
       header[0].StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase) ? header[0][7..] : header[0];

static async Task<FirebaseToken?> VerifyAndDecodeAsync(string? bearerHeader)
{
    var token = ExtractBearer(bearerHeader ?? string.Empty);
    if (string.IsNullOrWhiteSpace(token)) return null;
    try { return await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(token); }
    catch { return null; }
}

static bool HasAnyRole(FirebaseToken tok, params string[] roles)
{
    // Hem "role" (string) hem "roles" (array) desteği
    if (tok.Claims.TryGetValue("role", out var single) && single is string sr && roles.Contains(sr))
        return true;

    if (tok.Claims.TryGetValue("roles", out var multi) && multi is IEnumerable<object> arr)
        return arr.OfType<string>().Any(r => roles.Contains(r));

    return false;
}

/* ---------- Minimal API: Firestore Products (token + rol şart) ---------- */
var fsProducts = app.MapGroup("/api/fs/products").WithTags("Products (Firestore)");

fsProducts.MapGet("", async (HttpRequest req, FirestoreDb db) =>
{
    var decoded = await VerifyAndDecodeAsync(req.Headers.Authorization);
    if (decoded is null) return Results.Unauthorized(); // sadece token şartı (istersen public yapabilirsin)

    var snap = await db.Collection("products").OrderByDescending("createdAt").GetSnapshotAsync();
    var list = snap.Documents.Select(d => { var m = d.ToDictionary(); m["id"] = d.Id; return m; });
    return Results.Ok(list);
});

fsProducts.MapPost("", async (HttpRequest req, FirestoreDb db, ProductDto dto) =>
{
    var decoded = await VerifyAndDecodeAsync(req.Headers.Authorization);
    if (decoded is null) return Results.Unauthorized();
    if (!HasAnyRole(decoded, "Admin", "Staff")) return Results.Forbid();

    var data = new Dictionary<string, object>
    {
        ["title"] = dto.Title,
        ["price"] = dto.Price,
        ["stock"] = dto.Stock,
        ["imageUrl"] = dto.ImageUrl,
        ["createdAt"] = Timestamp.FromDateTime(DateTime.UtcNow)
    };
    var doc = await db.Collection("products").AddAsync(data);
    return Results.Ok(new { id = doc.Id });
});

fsProducts.MapPut("/{id}", async (HttpRequest req, FirestoreDb db, string id, ProductDto dto) =>
{
    var decoded = await VerifyAndDecodeAsync(req.Headers.Authorization);
    if (decoded is null) return Results.Unauthorized();
    if (!HasAnyRole(decoded, "Admin", "Staff")) return Results.Forbid();

    await db.Collection("products").Document(id).UpdateAsync(new Dictionary<string, object>
    {
        ["title"] = dto.Title,
        ["price"] = dto.Price,
        ["stock"] = dto.Stock,
        ["imageUrl"] = dto.ImageUrl
    });
    return Results.NoContent();
});

fsProducts.MapDelete("/{id}", async (HttpRequest req, FirestoreDb db, string id) =>
{
    var decoded = await VerifyAndDecodeAsync(req.Headers.Authorization);
    if (decoded is null) return Results.Unauthorized();
    if (!HasAnyRole(decoded, "Admin")) return Results.Forbid();

    await db.Collection("products").Document(id).DeleteAsync();
    return Results.NoContent();
});

app.Run();
public partial class Program { }
