using System.Security.Claims;
using System.Text.Encodings.Web;
using FirebaseAdmin.Auth;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;

namespace ECom.Api.Auth;

public class FirebaseAuthenticationHandler
  : AuthenticationHandler<AuthenticationSchemeOptions>
{
    public FirebaseAuthenticationHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder,
        ISystemClock clock) : base(options, logger, encoder, clock) { }

    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var authHeader = Request.Headers.Authorization.ToString();
        if (string.IsNullOrWhiteSpace(authHeader) || !authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            return AuthenticateResult.NoResult();

        var token = authHeader["Bearer ".Length..].Trim();

        try
        {
            // Firebase ID token'ını doğrula
            var decoded = await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(token);

            var uid   = decoded.Uid;
            var email = decoded.Claims.TryGetValue("email", out var eObj) ? eObj?.ToString() : null;

            // ---- Rolleri topla (role | roles) ----
            var roles = new List<string>();

            if (decoded.Claims.TryGetValue("role", out var roleObj) && roleObj is not null)
                roles.Add(roleObj.ToString()!);

            if (decoded.Claims.TryGetValue("roles", out var rolesObj) && rolesObj is not null)
            {
                switch (rolesObj)
                {
                    case IEnumerable<object> arr:
                        roles.AddRange(arr.Select(x => x?.ToString()).Where(s => !string.IsNullOrWhiteSpace(s))!);
                        break;
                    case string s:
                        roles.Add(s);
                        break;
                }
            }

            if (roles.Count == 0)
                roles.Add("Customer"); // default

            // ---- Claims oluştur ----
            var claims = new List<Claim>
            {
                new Claim("uid", uid),
                new Claim("email", email ?? string.Empty),
            };

            // Rolleri hem "role" hem ClaimTypes.Role olarak ekle
            foreach (var r in roles.Distinct(StringComparer.OrdinalIgnoreCase))
            {
                claims.Add(new Claim("role", r));
                claims.Add(new Claim(ClaimTypes.Role, r));
            }

            // Opsiyonel: permissions/scope aynen geçir
            if (decoded.Claims.TryGetValue("permissions", out var permObj) && permObj is not null)
            {
                if (permObj is IEnumerable<object> parr)
                    foreach (var p in parr.Select(x => x?.ToString()).Where(s => !string.IsNullOrWhiteSpace(s))!)
                        claims.Add(new Claim("permissions", p!));
                else
                    claims.Add(new Claim("permissions", permObj.ToString()!));
            }

            if (decoded.Claims.TryGetValue("scope", out var scopeObj) && scopeObj is not null)
                claims.Add(new Claim("scope", scopeObj.ToString()!));

            // 🔴 Kritik: nameType="email", roleType="role"
            var identity  = new ClaimsIdentity(claims, Scheme.Name, nameType: "email", roleType: "role");
            var principal = new ClaimsPrincipal(identity);
            var ticket    = new AuthenticationTicket(principal, Scheme.Name);

            return AuthenticateResult.Success(ticket);
        }
        catch (Exception ex)
        {
            return AuthenticateResult.Fail(ex);
        }
    }
}
