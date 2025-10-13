using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Net.Http;            
using System.Threading.Tasks;

namespace ECom.Api.Tests;

public static class TestAuthDefaults
{
    public const string Scheme = "Test";
    public const string HeaderPrefix = "Test"; // Authorization: Test <ROLE>
}

public class TestAuthHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    public TestAuthHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger, UrlEncoder encoder, ISystemClock clock)
        : base(options, logger, encoder, clock) { }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var hdr = Request.Headers.Authorization.ToString();
        if (string.IsNullOrWhiteSpace(hdr) || !hdr.StartsWith($"{TestAuthDefaults.HeaderPrefix} "))
            return Task.FromResult(AuthenticateResult.NoResult());

        var role = hdr.Substring(TestAuthDefaults.HeaderPrefix.Length + 1).Trim();
        var claims = new List<Claim>
        {
            new("role", role),
            new(ClaimTypes.NameIdentifier, "test-user"),
            new("user_id", "test-user")
        };
        var identity = new ClaimsIdentity(claims, TestAuthDefaults.Scheme);
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, TestAuthDefaults.Scheme);
        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}

public class TestWebAppFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureTestServices(services =>
        {
            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = TestAuthDefaults.Scheme;
                options.DefaultChallengeScheme = TestAuthDefaults.Scheme;
            })
            .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>(TestAuthDefaults.Scheme, _ => { });
        });
    }
}

public static class HttpClientAuthExtensions
{
    public static void AsRole(this HttpClient client, string role)
    {
        client.DefaultRequestHeaders.Remove("Authorization");
        client.DefaultRequestHeaders.Add("Authorization", $"{TestAuthDefaults.HeaderPrefix} {role}");
    }
    public static void ClearAuth(this HttpClient client)
    {
        client.DefaultRequestHeaders.Remove("Authorization");
    }
}
