using System;
using System.IO;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using ECom.Api.Models;
using ECom.Api.Services;
using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Google.Cloud.Firestore;
using Microsoft.AspNetCore.Mvc;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

/* ---------- MVC / Controllers ---------- */
builder.Services.AddControllers().SetCompatibilityVersion(CompatibilityVersion.Latest);

/* ---------- Domain Services (In-Memory) ---------- */
builder.Services.AddSingleton<IProductStore, InMemoryProductStore>();   // <— DEĞİŞTİ
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

// ADC (env değişkeninden) kimlik bilgisi
GoogleCredential adc = GoogleCredential.GetApplicationDefault();

// FirebaseApp’i çift create etme (idempotent)
try { _ = FirebaseApp.DefaultInstance; }
catch (InvalidOperationException) { FirebaseApp.Create(new AppOptions { Credential = adc }); }

// Firestore DI
builder.Services.AddSingleton(_ =>
    new FirestoreDbBuilder { ProjectId = projectId, Credential = adc }.Build());

/* ---------- CORS (Next.js front) ---------- */
var allowedFromConfig = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();
var corsOrigins = allowedFromConfig.Concat(new[] { "http://localhost:3000" }).Distinct().ToArray();

builder.Services.AddCors(opt =>
{
    opt.AddPolicy("frontend", p => p.WithOrigins(corsOrigins).AllowAnyHeader().AllowAnyMethod().AllowCredentials());
});

/* ---------- Swagger (+ Bearer) ---------- */
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "ECom API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Bearer {ID_TOKEN}"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement {
        { new OpenApiSecurityScheme{ Reference = new OpenApiReference{ Type = ReferenceType.SecurityScheme, Id = "Bearer"}}, new string[]{} }
    });
});

var app = builder.Build();

/* ---------- Pipeline ---------- */
app.UseCors("frontend");
app.UseSwagger();
app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "ECom API v1"));
app.MapGet("/", () => Results.Redirect("/swagger"));
app.MapControllers();

/* IOC teşhis (artık IProductStore var) */
app.MapGet("/api/diag/ioc", ([FromServices] IServiceProvider sp) =>
{
    return Results.Ok(new {
        hasIProductStore = sp.GetService<IProductStore>() != null
    });
});

/* ---------- Auth Helper (Firebase ID Token) ---------- */
static async Task<string?> VerifyAndGetUid(string? bearerToken)
{
    if (string.IsNullOrWhiteSpace(bearerToken)) return null;
    var token = bearerToken.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase) ? bearerToken[7..] : bearerToken;
    var decoded = await FirebaseAdmin.Auth.FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(token);
    return decoded.Uid;
}

/* ---------- Products (Firestore - Minimal API, yeni prefix) ---------- */
var fsProducts = app.MapGroup("/api/fs/products").WithTags("Products (Firestore)");

fsProducts.MapGet("", async (FirestoreDb db) =>
{
    var snap = await db.Collection("products").OrderByDescending("createdAt").GetSnapshotAsync();
    var list = snap.Documents.Select(d => { var m = d.ToDictionary(); m["id"] = d.Id; return m; });
    return Results.Ok(list);
});

fsProducts.MapPost("", async (HttpRequest req, FirestoreDb db, ProductDto dto) =>
{
    var uid = await VerifyAndGetUid(req.Headers.Authorization);
    if (uid is null) return Results.Unauthorized();

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
    var uid = await VerifyAndGetUid(req.Headers.Authorization);
    if (uid is null) return Results.Unauthorized();

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
    var uid = await VerifyAndGetUid(req.Headers.Authorization);
    if (uid is null) return Results.Unauthorized();

    await db.Collection("products").Document(id).DeleteAsync();
    return Results.NoContent();
});

app.Run();
