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

    public OrdersController(ICartService carts, IOrderService orders)
    {
        _carts = carts;
        _orders = orders;
    }

    public record CreateOrderDto(string CartId, Customer? Customer);

    // CREATE (müşteri)
    [HttpPost]
    public ActionResult<Order> Create([FromBody] CreateOrderDto body)
    {
        var cart = _carts.Get(body.CartId);
        if (cart is null) return NotFound(new { message = "Cart not found" });
        if (cart.Items.Count == 0) return BadRequest(new { message = "Cart is empty" });

        var order = _orders.CreateFromCart(body.CartId, cart, body.Customer);
        _carts.Clear(body.CartId);
        return Ok(order);
    }

    // READ
    [HttpGet("{id}")]
    public ActionResult<Order> Get(string id)
    {
        var o = _orders.Get(id);
        return o is null ? NotFound() : Ok(o);
    }

    // UPDATE STATUS (Admin/Staff)
    [HttpPut("{id}/status")]
    [Authorize(Policy = "OrdersManage")]
    public IActionResult UpdateStatus(string id, [FromBody] UpdateOrderStatusDto dto)
    {
        var updated = _orders.UpdateStatus(id, dto.Status);
        return updated is null ? NotFound() : NoContent();
    }
}
