using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using System.Threading.Tasks;
using Xunit;

namespace ECom.Api.Tests;

public class OrdersAuthTests : IClassFixture<TestWebAppFactory>
{
    private readonly TestWebAppFactory _app;
    public OrdersAuthTests(TestWebAppFactory app) => _app = app;

    [Fact]
    public async Task CreateOrder_WithoutToken_Returns401()
    {
        var client = _app.CreateClient();
        client.ClearAuth();

        var res = await client.PostAsJsonAsync("/api/orders", new { cartId = "cart_test" });
        res.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task CreateOrder_WithCustomer_IsAuthorized()
    {
        var client = _app.CreateClient();
        client.AsRole("Customer");

        var res = await client.PostAsJsonAsync("/api/orders", new { cartId = "cart_test" });
        res.StatusCode.Should().BeOneOf(HttpStatusCode.NotFound, HttpStatusCode.BadRequest, HttpStatusCode.OK, HttpStatusCode.Created);
    }

    [Fact]
    public async Task UpdateStatus_WithCustomer_Returns403()
    {
        var client = _app.CreateClient();
        client.AsRole("Customer");

        var res = await client.PutAsJsonAsync("/api/orders/fake/status", new { status = 1 });
        res.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task UpdateStatus_WithAdminOrStaff_IsAuthorized()
    {
        var client = _app.CreateClient();
        client.AsRole("Admin");

        var res = await client.PutAsJsonAsync("/api/orders/fake/status", new { status = 1 });
        res.StatusCode.Should().BeOneOf(HttpStatusCode.NoContent, HttpStatusCode.OK, HttpStatusCode.NotFound, HttpStatusCode.Conflict);
    }
}
