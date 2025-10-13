using System.Linq;
using ECom.Api.Middlewares;
using ECom.Api.Models;
using ECom.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECom.Api.Controllers;

[ApiController]
[Route("api/orders")]
public class OrdersController : ControllerBase
{
    private readonly ICartService _carts;
    private readonly IOrderService _orders;
    private readonly IEventLogger _events;

    public OrdersController(ICartService carts, IOrderService orders, IEventLogger events)
    {
        _carts = carts;
        _orders = orders;
        _events = events;
    }

    public record CreateOrderDto(string CartId, Customer? Customer);

    // CREATE → müşteri
    [HttpPost]
    [Authorize(Policy = "CartCheckout")]
    public ActionResult<Order> Create([FromBody] CreateOrderDto body)
    {
        var cart = _carts.Get(body.CartId);
        if (cart is null) return NotFound(new { message = "Cart not found" });
        if (cart.Items.Count == 0) return BadRequest(new { message = "Cart is empty" });

        var order = _orders.CreateFromCart(body.CartId, cart, body.Customer);
        _carts.Clear(body.CartId);
        return Ok(order); // istersen CreatedAtAction'a çevirebiliriz
    }

    // READ → şimdilik genel auth
    [HttpGet("{id}")]
    [Authorize]
    public ActionResult<Order> Get(string id)
    {
        var o = _orders.Get(id);
        return o is null ? NotFound() : Ok(o);
    }

    // UPDATE STATUS → Admin/Staff
    [HttpPut("{id}/status")]
    [Authorize(Policy = "OrdersManage")]
    public async Task<IActionResult> UpdateStatus(string id, [FromBody] UpdateOrderStatusDto dto)
    {
        var before = _orders.Get(id);
        if (before is null) return NotFound();

        var updated = _orders.UpdateStatus(id, dto.Status);
        if (updated is null) return NotFound();

        // Event log
        var cid = HttpContext.Items[CorrelationIdMiddleware.HeaderName]?.ToString();
        var uid = User.Identity?.Name ?? User.Claims.FirstOrDefault(c => c.Type == "user_id")?.Value;

        await _events.LogAsync(new EventLog(
            At: DateTimeOffset.UtcNow,
            Type: "OrderStatusChanged",
            OrderId: id,
            OldStatus: before.Status.ToString(),
            NewStatus: dto.Status.ToString(),
            UserId: uid,
            CorrelationId: cid
        ));

        return NoContent();
    }
}
