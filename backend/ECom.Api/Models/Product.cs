namespace ECom.Api.Models;

public class Product
{
    public string Id { get; set; } = default!;      // string id
    public string Title { get; set; } = default!;
    public decimal Price { get; set; }              // decimal para
    public int Stock { get; set; }
    public string? ImageUrl { get; set; }
}
