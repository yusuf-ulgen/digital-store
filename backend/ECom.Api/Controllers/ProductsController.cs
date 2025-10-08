using ECom.Api.Models;
using ECom.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace ECom.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController(IProductStore store) : ControllerBase
{
    [HttpGet]
    public ActionResult<IEnumerable<Product>> GetAll() => Ok(store.GetAll());

    [HttpGet("{id:guid}")]
    public ActionResult<Product> Get(Guid id)
        => store.Get(id) is { } p ? Ok(p) : NotFound();

    [HttpPost]
    public ActionResult<Product> Create(Product p)
    {
        var created = store.Add(p);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    public IActionResult Update(Guid id, Product p)
        => store.Update(id, p) ? NoContent() : NotFound();

    [HttpDelete("{id:guid}")]
    public IActionResult Delete(Guid id)
        => store.Delete(id) ? NoContent() : NotFound();
}
