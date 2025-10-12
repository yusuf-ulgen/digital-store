namespace ECom.Api.Models;

public enum OrderStatus { Created, Paid, Packed, Shipped, Delivered, Cancelled }

public class OrderItem
{
    public string ProductId { get; set; } = default!;
    public string Title { get; set; } = default!;
    public string ImageUrl { get; set; } = default!;
    public decimal UnitPrice { get; set; }
    public int Qty { get; set; }
    public decimal LineTotal => UnitPrice * Qty;
}

public class Customer
{
    public string? Name { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
}

public class Order
{
    public string Id { get; set; } = "ord_" + Guid.NewGuid().ToString("N")[..10];
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CartId { get; set; }
    public List<OrderItem> Items { get; set; } = new();
    public decimal Total => Items.Sum(i => i.LineTotal);
    public OrderStatus Status { get; set; } = OrderStatus.Created;
    public string? PaymentId { get; set; }
    public Customer? Customer { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
