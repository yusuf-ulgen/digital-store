using FirebaseAdmin;
using FirebaseAdmin.Auth;
using Google.Apis.Auth.OAuth2;

// Firebase credential dosyasını bulma fonksiyonu
static string FindCredPath()
{
    var env = Environment.GetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS");
    if (!string.IsNullOrWhiteSpace(env) && File.Exists(env)) return env;

    var baseDir = AppContext.BaseDirectory;
    string[] candidates = new[]
    {
        Path.GetFullPath(Path.Combine(baseDir, "..", "..", "..", "..", "..", "secrets", "firebase-admin.json")),
        Path.GetFullPath(Path.Combine(baseDir, "..", "..", "..", "..", "secrets", "firebase-admin.json")),
        Path.GetFullPath(Path.Combine(Environment.CurrentDirectory, "..", "secrets", "firebase-admin.json")),
        Path.GetFullPath(Path.Combine(Environment.CurrentDirectory, "secrets", "firebase-admin.json")),
    };
    
    foreach (var p in candidates)
    {
        if (File.Exists(p)) return p;
    }

    throw new FileNotFoundException("firebase-admin.json bulunamadı. GOOGLE_APPLICATION_CREDENTIALS ortam değişkeni ile yol belirtin.");
}

// Ana işlem
try
{
    var credPath = FindCredPath();
    Console.WriteLine($"Using credential: {credPath}");
    
    FirebaseApp.Create(new AppOptions 
    { 
        Credential = GoogleCredential.FromFile(credPath) 
    });

    // Seed data
    var seed = new (string Email, string Password, string Role)[]
    {
        ("admin@example.com", "Admin123!", "Admin"),
        ("staff@example.com", "Staff123!", "Staff"),
        ("customer@example.com", "Customer1!", "Customer"),
    };

    foreach (var (email, password, role) in seed)
    {
        UserRecord user;
        try
        {
            user = await FirebaseAuth.DefaultInstance.GetUserByEmailAsync(email);
            Console.WriteLine($"[OK] Var olan kullanıcı: {email} (uid={user.Uid})");
        }
        catch (FirebaseAuthException ex) when (ex.AuthErrorCode == AuthErrorCode.UserNotFound)
        {
            var userRecord = new UserRecordArgs
            {
                Email = email,
                EmailVerified = false,
                Password = password,
                Disabled = false,
            };
            user = await FirebaseAuth.DefaultInstance.CreateUserAsync(userRecord);
            Console.WriteLine($"[NEW] Oluşturuldu: {email} (uid={user.Uid}) şifre={password}");
        }

        // Custom claims ayarla
        var claims = new Dictionary<string, object> { ["role"] = role };
        await FirebaseAuth.DefaultInstance.SetCustomUserClaimsAsync(user.Uid, claims);
        Console.WriteLine($"[CLAIM] {email} => role={role}");
    }

    Console.WriteLine("\n✓ Custom claims başarıyla ayarlandı!");
    Console.WriteLine("Not: Token'ı yenilemek için logout/login yapın veya getIdToken(true) kullanın.");
}
catch (Exception ex)
{
    Console.WriteLine($"\n✗ HATA: {ex.Message}");
    Console.WriteLine($"Detay: {ex.GetType().Name}");
    if (ex.InnerException != null)
        Console.WriteLine($"Inner: {ex.InnerException.Message}");
}