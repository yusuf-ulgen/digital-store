using ECom.Api.Models;
using ECom.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace ECom.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CartController : ControllerBase
{
    private readonly ICartService _carts;
    private readonly IProductStore _products;   // <— DEĞİŞTİ

    public CartController(ICartService carts, IProductStore products)   // <— DEĞİŞTİ
    {
        _carts = carts;
        _products = products;
    }

    private string EnsureCartId()
    {
        var id = HttpContext.Request.Query["cartId"].FirstOrDefault()
                 ?? HttpContext.Request.Headers["X-Cart-Id"].FirstOrDefault()
                 ?? Guid.NewGuid().ToString("N");
        Response.Headers["X-Cart-Id"] = id;
        return id;
    }

    [HttpGet]
    public ActionResult<Cart> Get()
    {
        var id = EnsureCartId();
        return Ok(_carts.Get(id));
    }

    public record AddItemDto(string ProductId, int Qty = 1);

    [HttpPost("items")]
    public ActionResult<Cart> AddItem([FromBody] AddItemDto body)
    {
        var id = EnsureCartId();
        var p = _products.Get(body.ProductId);
        if (p is null) return NotFound(new { message = "Product not found" });

        var cart = _carts.AddItem(id, p, Math.Max(1, body.Qty));
        return Ok(cart);
    }

    public record SetQtyDto(int Qty);

    [HttpPut("items/{productId}")]
    public ActionResult<Cart> SetQty(string productId, [FromBody] SetQtyDto body)
    {
        var id = EnsureCartId();
        return Ok(_carts.SetQty(id, productId, body.Qty));
    }

    [HttpDelete("items/{productId}")]
    public ActionResult<Cart> Remove(string productId)
    {
        var id = EnsureCartId();
        return Ok(_carts.RemoveItem(id, productId));
    }

    [HttpDelete]
    public IActionResult Clear()
    {
        var id = EnsureCartId();
        _carts.Clear(id);
        return NoContent();
    }
}
