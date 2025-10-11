using ECom.Api.Models;
using ECom.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace ECom.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
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

    [HttpPost]
    public ActionResult<Order> Create([FromBody] CreateOrderDto body)
    {
        var cart = _carts.Get(body.CartId);
        if (cart.Items.Count == 0)
            return BadRequest(new { message = "Cart is empty" });

        var order = _orders.CreateFromCart(body.CartId, cart, body.Customer);
        _carts.Clear(body.CartId); // istersen kaldır
        return Ok(order);
    }

    [HttpGet("{id}")]
    public ActionResult<Order> Get(string id)
    {
        var o = _orders.Get(id);
        return o is null ? NotFound() : Ok(o);
    }
}
