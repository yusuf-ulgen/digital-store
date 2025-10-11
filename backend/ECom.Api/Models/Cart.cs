using System.Linq;

namespace ECom.Api.Models;

public class Cart
{
    public string Id { get; set; } = default!;
    public List<CartItem> Items { get; } = new();

    public decimal Total => Items.Sum(i => i.UnitPrice * i.Qty);
}
