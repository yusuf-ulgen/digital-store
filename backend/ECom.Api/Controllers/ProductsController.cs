using ECom.Api.Services;
using Microsoft.AspNetCore.Mvc;
using ECom.Api.Models;

namespace ECom.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductStore _store;
    public ProductsController(IProductStore store) => _store = store;

    [HttpGet]
    public IActionResult GetAll() => Ok(_store.GetAll());

    [HttpGet("{id}")]
    public IActionResult Get(string id) => _store.Get(id) is { } p ? Ok(p) : NotFound();

    [HttpPost]
    public IActionResult Add([FromBody] ProductDto dto)
    {
        var p = _store.Add(dto.Title, dto.Price, dto.Stock, dto.ImageUrl);
        return Ok(new { id = p.Id });
    }

    [HttpPut("{id}")]
    public IActionResult Update(string id, [FromBody] ProductDto dto)
    {
        var p = _store.Update(id, dto.Title, dto.Price, dto.Stock, dto.ImageUrl);
        return p is null ? NotFound() : NoContent();
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(string id) => _store.Delete(id) ? NoContent() : NotFound();
}
