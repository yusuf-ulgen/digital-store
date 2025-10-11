namespace ECom.Api.Models;

public class CartItem
{
    public string ProductId { get; set; } = default!;
    public string Title { get; set; } = default!;
    public string? ImageUrl { get; set; }
    public decimal UnitPrice { get; set; }   // decimal
    public int Qty { get; set; }

    public decimal LineTotal => UnitPrice * Qty;
}
