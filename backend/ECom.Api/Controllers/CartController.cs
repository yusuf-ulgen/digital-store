using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ECom.Api.Models;
using ECom.Api.Services;

namespace ECom.Api.Controllers;

[ApiController]
[Route("api/cart")]
public class CartController : ControllerBase
{
    private readonly ICartService _carts;
    private readonly IProductStore _products;
    private readonly IOrderService _orders;

    public CartController(ICartService carts, IProductStore products, IOrderService orders)
    {
        _carts = carts;
        _products = products;
        _orders = orders;
    }

    // Tek bir yerde cartId üret/oku ve response'a geri yaz
    private string EnsureCartId()
    {
        var id = HttpContext.Request.Query["cartId"].FirstOrDefault()
                 ?? HttpContext.Request.Headers["X-Cart-Id"].FirstOrDefault()
                 ?? Guid.NewGuid().ToString("N");
        Response.Headers["X-Cart-Id"] = id;
        return id;
    }

    // CART → READ
    [HttpGet]
    [Authorize(Policy = "CartCheckout")]
    public ActionResult<Cart> Get()
    {
        var id = EnsureCartId();
        return Ok(_carts.Get(id));
    }

    // CART → ADD ITEM
    public record AddItemDto(string ProductId, int Qty = 1);

    [HttpPost("items")]
    [Authorize(Policy = "CartCheckout")]
    public ActionResult<Cart> AddItem([FromBody] AddItemDto body)
    {
        var id = EnsureCartId();

        var p = _products.Get(body.ProductId);
        if (p is null) return NotFound(new { message = "Product not found" });

        var cart = _carts.AddItem(id, p, Math.Max(1, body.Qty));
        return Ok(cart);
    }

    // CART → SET QTY
    public record SetQtyDto(int Qty);

    [HttpPut("items/{productId}")]
    [Authorize(Policy = "CartCheckout")]
    public ActionResult<Cart> SetQty(string productId, [FromBody] SetQtyDto body)
    {
        var id = EnsureCartId();
        return Ok(_carts.SetQty(id, productId, body.Qty));
    }

    // CART → REMOVE ITEM
    [HttpDelete("items/{productId}")]
    [Authorize(Policy = "CartCheckout")]
    public ActionResult<Cart> Remove(string productId)
    {
        var id = EnsureCartId();
        return Ok(_carts.RemoveItem(id, productId));
    }

    // CART → CLEAR
    [HttpDelete]
    [Authorize(Policy = "CartCheckout")]
    public IActionResult Clear()
    {
        var id = EnsureCartId();
        _carts.Clear(id);
        return NoContent();
    }

    // CART → CHECKOUT (siparişe dönüştür)
    public record CheckoutDto(Customer? Customer, string? PaymentMethod = null);

    [HttpPost("checkout")]
    [Authorize(Policy = "CartCheckout")] // giriş yapmış müşteri
    public IActionResult Checkout([FromBody] CheckoutDto dto)
    {
        var id = EnsureCartId();
        var cart = _carts.Get(id);
        if (cart is null) return NotFound(new { message = "Cart not found" });
        if (cart.Items.Count == 0) return BadRequest(new { message = "Cart is empty" });

        var order = _orders.CreateFromCart(id, cart, dto.Customer);

        _carts.Clear(id);

        return Ok(new
        {
            orderId = order.Id,
            status = order.Status,
            total = order.Total,
        });
    }
}
