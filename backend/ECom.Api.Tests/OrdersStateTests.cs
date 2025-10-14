using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Xunit;

public class OrdersStateTests : IClassFixture<ApiFactory> // kendi factory sınıfına göre
{
    private readonly HttpClient _client;
    public OrdersStateTests(ApiFactory f) => _client = f.CreateClient();

    [Fact]
    public async Task Created_To_Shipped_Should_Conflict409()
    {
        var id = await TestData.CreateOrderAsync(_client, status: "Created"); // helper’ına göre düzenle
        var res = await _client.PutAsJsonAsync($"/api/orders/{id}/status", new { To = "Shipped" });
        res.StatusCode.Should().Be(HttpStatusCode.Conflict);

        var problem = await res.Content.ReadFromJsonAsync<ProblemDetails>();
        problem!.Title.Should().Be("InvalidStateTransition");
    }
}
