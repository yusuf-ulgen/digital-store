using ECom.Api.Models;
using ECom.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECom.Api.Controllers;

[ApiController]
[Route("api/products")]
public class ProductsController : ControllerBase
{
    private readonly IProductStore _store;
    public ProductsController(IProductStore store) => _store = store;

    // PUBLIC READ
    [HttpGet]
    public IActionResult GetAll() => Ok(_store.GetAll());

    [HttpGet("{id}")]
    public IActionResult Get(string id) => _store.Get(id) is { } p ? Ok(p) : NotFound();

    // WRITE → Admin/Staff (Policy: ProductsWrite)
    [HttpPost]
    [Authorize(Policy = "ProductsWrite")]
    public IActionResult CreateProduct([FromBody] CreateProductDto dto)
    {
        var p = _store.Add(dto.Title, dto.Price, dto.Stock, dto.ImageUrl);
        return CreatedAtAction(nameof(Get), new { id = p.Id }, new { id = p.Id });
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "ProductsWrite")]
    public IActionResult UpdateProduct(string id, [FromBody] UpdateProductDto dto)
    {
        var p = _store.Update(id, dto.Title, dto.Price, dto.Stock, dto.ImageUrl);
        return p is null ? NotFound() : NoContent();
    }

    // DELETE → Sadece Admin
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public IActionResult DeleteProduct(string id) => _store.Delete(id) ? NoContent() : NotFound();
}

// İstersen tek DTO da kullanabilirsin; burada Create/Update ayrıştırıldı
public record CreateProductDto(string Title, decimal Price, int Stock, string ImageUrl);
public record UpdateProductDto(string Title, decimal Price, int Stock, string ImageUrl);
