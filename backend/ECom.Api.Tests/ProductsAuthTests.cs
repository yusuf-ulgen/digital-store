using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using System.Threading.Tasks;
using Xunit;

namespace ECom.Api.Tests;

public class ProductsAuthTests : IClassFixture<TestWebAppFactory>
{
    private readonly TestWebAppFactory _app;
    public ProductsAuthTests(TestWebAppFactory app) => _app = app;

    [Fact]
    public async Task Put_WithoutToken_Returns401()
    {
        var client = _app.CreateClient();
        client.ClearAuth();

        var res = await client.PutAsJsonAsync("/api/products/abc", new { title = "X", price = 10, stock = 1, imageUrl = "http://x" });
        res.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Put_WithCustomer_Returns403()
    {
        var client = _app.CreateClient();
        client.AsRole("Customer");

        var res = await client.PutAsJsonAsync("/api/products/abc", new { title = "X", price = 10, stock = 1, imageUrl = "http://x" });
        res.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task Put_WithAdminOrStaff_IsAuthorized()
    {
        var client = _app.CreateClient();
        client.AsRole("Admin");

        var res = await client.PutAsJsonAsync("/api/products/abc", new { title = "X", price = 10, stock = 1, imageUrl = "http://x" });
        res.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.NoContent, HttpStatusCode.NotFound);
    }
}
