using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Google.Cloud.Firestore;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// ---- Firebase Admin init ----
var credPath = Environment.GetEnvironmentVariable("FIREBASE_CONFIG_PATH");
if (string.IsNullOrWhiteSpace(credPath) || !File.Exists(credPath))
    throw new Exception($"FIREBASE_CONFIG_PATH geçersiz: {credPath}");

var projectId = builder.Configuration["Firebase:ProjectId"]
    ?? throw new Exception("Firebase:ProjectId eksik.");

// Firebase Admin
using var stream = new FileStream(credPath, FileMode.Open, FileAccess.Read);
var googleCredential = GoogleCredential.FromStream(stream);
FirebaseApp.Create(new AppOptions { Credential = googleCredential });

// ---- Firestore DI ----
builder.Services.AddSingleton(provider =>
{
    using var s = new FileStream(credPath, FileMode.Open, FileAccess.Read);
    var cred = GoogleCredential.FromStream(s);
    return new FirestoreDbBuilder
    {
        ProjectId = projectId,
        Credential = cred
    }.Build();
});

// ---- CORS ----
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();
builder.Services.AddCors(o =>
{
    o.AddDefaultPolicy(p => p.WithOrigins(allowedOrigins).WithOrigins("http://localhost:3000").AllowAnyHeader().AllowAnyMethod());
});

// ---- Swagger ----
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "ECom API", Version = "v1" });
});

var app = builder.Build();
app.UseCors();
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "ECom API v1");
});

// ---- ID Token doğrulama helper ----
static async Task<string?> VerifyAndGetUid(string? bearerToken)
{
    if (string.IsNullOrWhiteSpace(bearerToken)) return null;
    var token = bearerToken.StartsWith("Bearer ") ? bearerToken[7..] : bearerToken;
    var decoded = await FirebaseAdmin.Auth.FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(token);
    return decoded.Uid;
}

// ---- Public: ürünleri listele (read herkese açık istersen) ----
app.MapGet("/api/products", async (FirestoreDb db) =>
{
    var snap = await db.Collection("products").OrderByDescending("createdAt").GetSnapshotAsync();
    var list = snap.Documents.Select(d =>
    {
        var data = d.ToDictionary();
        data["id"] = d.Id;
        return data;
    });
    return Results.Ok(list);
});

// ---- Protected: ürün ekle ----
app.MapPost("/api/products", async (HttpRequest req, FirestoreDb db, ProductDto dto) =>
{
    var uid = await VerifyAndGetUid(req.Headers.Authorization);
    if (uid is null) return Results.Unauthorized();

    var col = db.Collection("products");
    var data = new Dictionary<string, object>
    {
        ["title"] = dto.Title,
        ["price"] = dto.Price,
        ["stock"] = dto.Stock,
        ["imageUrl"] = dto.ImageUrl,
        ["createdAt"] = Timestamp.FromDateTime(DateTime.UtcNow)
    };
    var doc = await col.AddAsync(data);
    return Results.Ok(new { id = doc.Id });
});

// ---- Protected: ürün güncelle ----
app.MapPut("/api/products/{id}", async (HttpRequest req, FirestoreDb db, string id, ProductDto dto) =>
{
    var uid = await VerifyAndGetUid(req.Headers.Authorization);
    if (uid is null) return Results.Unauthorized();

    var doc = db.Collection("products").Document(id);
    await doc.UpdateAsync(new Dictionary<string, object>
    {
        ["title"] = dto.Title,
        ["price"] = dto.Price,
        ["stock"] = dto.Stock,
        ["imageUrl"] = dto.ImageUrl
    });
    return Results.NoContent();
});

// ---- Protected: ürün sil ----
app.MapDelete("/api/products/{id}", async (HttpRequest req, FirestoreDb db, string id) =>
{
    var uid = await VerifyAndGetUid(req.Headers.Authorization);
    if (uid is null) return Results.Unauthorized();

    await db.Collection("products").Document(id).DeleteAsync();
    return Results.NoContent();
});

app.Run();
record ProductDto(string Title, double Price, int Stock, string ImageUrl);