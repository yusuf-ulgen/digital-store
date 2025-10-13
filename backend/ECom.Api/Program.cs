using System;
using System.IO;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using ECom.Api.Models;
using ECom.Api.Services;
using ECom.Api.Auth;
using ECom.Api.Middlewares;
using FirebaseAdmin;
using FirebaseAdmin.Auth;
using Google.Apis.Auth.OAuth2;
using Google.Cloud.Firestore;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Primitives;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

/* ---------- MVC / Controllers ---------- */
builder.Services.AddControllers();

/* ---------- Domain Services (In-Memory) ---------- */
builder.Services.AddSingleton<IProductStore, InMemoryProductStore>();
builder.Services.AddSingleton<ICartService, InMemoryCartService>();
builder.Services.AddSingleton<IOrderService, InMemoryOrderService>();
builder.Services.AddSingleton<IPaymentService, FakePaymentService>();
builder.Services.AddSingleton<IEventLogger, InMemoryEventLogger>();

/* ---------- Firebase Admin & Firestore ---------- */
var projectId = builder.Configuration["Firebase:ProjectId"]
    ?? throw new Exception("Firebase:ProjectId eksik.");

// Test harici ortamlarda FirebaseApp başlat
if (!builder.Environment.IsEnvironment("Testing"))
{
    EnsureFirebaseApp(builder);
}

// AppOptions ile tek noktadan başlat
static void EnsureFirebaseApp(WebApplicationBuilder builder)
{
    if (FirebaseApp.DefaultInstance is not null) return;   // idempotent

    // Kimlik bilgisi yolu: config→ENV→default
    var credPath =
        builder.Configuration["FIREBASE_CREDENTIALS"]
        ?? Environment.GetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS")
        ?? "secrets/firebase-admin.json";

    FirebaseApp.Create(new AppOptions
    {
        Credential = GoogleCredential.FromFile(credPath)
    });
}

// Firestore (ADC ile) — prod/dev’de çalışır, testte Firestore’a ihtiyacın yoksa testlerde bu servisi mock’la
var adc = GoogleCredential.GetApplicationDefault();
builder.Services.AddSingleton(_ =>
    new FirestoreDbBuilder { ProjectId = projectId, Credential = adc }.Build());

/* ---------- Auth ---------- */
builder.Services.AddAuthentication("Firebase")
    .AddScheme<AuthenticationSchemeOptions, FirebaseAuthenticationHandler>("Firebase", _ => {});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("ProductsWrite", p => p.RequireClaim("role", "Admin", "Staff"));
    options.AddPolicy("OrdersManage",  p => p.RequireClaim("role", "Admin", "Staff"));
    options.AddPolicy("CartCheckout",  p => p.RequireClaim("role", "Customer"));
});

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
        Description = "Firebase ID token: 'Bearer <ID_TOKEN>' olarak gir"
    };
    c.AddSecurityDefinition("Bearer", bearerScheme);
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        { new OpenApiSecurityScheme {
              Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }}, Array.Empty<string>() }
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
        dict["role"] = "Admin";
        await FirebaseAuth.DefaultInstance.SetCustomUserClaimsAsync(user.Uid, dict);
        Console.WriteLine($"[BOOTSTRAP] {adminEmail} → Admin atandı");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[BOOTSTRAP] Hata: {ex.Message}");
    }
}

/* ---------- Pipeline ---------- */
// Swagger en başta
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "ECom API v1");
    c.RoutePrefix = "swagger";
});

// app.UseHttpsRedirection(); // http kullanıyorsan kapalı kalsın
app.UseMiddleware<CorrelationIdMiddleware>();
app.UseMiddleware<GlobalExceptionMiddleware>();

app.UseRouting();
app.UseCors("frontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// root ve health — Swagger’a gizli
app.MapGet("/", () => Results.Redirect("/swagger")).ExcludeFromDescription();
app.MapGet("/health", () => Results.Text("ok")).ExcludeFromDescription();

/* ---------- Helpers: Token doğrulama ve rol kontrolü ---------- */
static string? ExtractBearer(StringValues header)
    => header.Count == 0 ? null :
       header[0].StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase) ? header[0][7..] : header[0];

static async Task<FirebaseToken?> VerifyAndDecodeAsync(StringValues authHeader)
{
    var token = ExtractBearer(authHeader);
    if (string.IsNullOrWhiteSpace(token)) return null;
    try { return await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(token); }
    catch { return null; }
}

static bool HasAnyRole(FirebaseToken tok, params string[] roles)
{
    if (tok.Claims.TryGetValue("role", out var single) && single is string sr && roles.Contains(sr)) return true;
    if (tok.Claims.TryGetValue("roles", out var multi) && multi is IEnumerable<object> arr)
        return arr.OfType<string>().Any(r => roles.Contains(r));
    return false;
}

/* ---------- Minimal API: Firestore Products (token + rol şart) ---------- */
var fsProducts = app.MapGroup("/api/fs/products").WithTags("Products (Firestore)");

fsProducts.MapGet("", async (HttpRequest req, FirestoreDb db) =>
{
    var decoded = await VerifyAndDecodeAsync(req.Headers.Authorization);
    if (decoded is null) return Results.Unauthorized();

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
