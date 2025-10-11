using System.Collections.Concurrent;
using ECom.Api.Models;

namespace ECom.Api.Services;

public class InMemoryOrderService : IOrderService
{
    private readonly ConcurrentDictionary<string, Order> _orders = new();

    public Order CreateFromCart(string cartId, Cart cart, Customer? customer)
    {
        var order = new Order
        {
            CartId   = cartId,
            Customer = customer,
            Items    = cart.Items.Select(i => new OrderItem
            {
                ProductId = i.ProductId,
                Title     = i.Title,
                ImageUrl  = i.ImageUrl,
                UnitPrice = i.UnitPrice,
                Qty       = i.Qty
            }).ToList()
        };
        _orders[order.Id] = order;
        return order;
    }

    public Order? Get(string orderId) =>
        _orders.TryGetValue(orderId, out var o) ? o : null;

    public void MarkPaid(string orderId, string paymentId)
    {
        if (_orders.TryGetValue(orderId, out var o))
        {
            o.Status    = OrderStatus.Paid;
            o.PaymentId = paymentId;
        }
    }
}
