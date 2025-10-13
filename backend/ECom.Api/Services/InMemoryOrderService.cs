using System.Collections.Concurrent;
using System.Linq;
using ECom.Api.Models;

namespace ECom.Api.Services;

public class InMemoryOrderService : IOrderService
{
    private static readonly ConcurrentDictionary<string, Order> _store = new();

    // Geçiş tablosu (en basit hali)
    private static readonly Dictionary<OrderStatus, OrderStatus[]> _next = new()
    {
        [OrderStatus.Created]   = new[] { OrderStatus.Paid, OrderStatus.Cancelled },
        [OrderStatus.Paid]      = new[] { OrderStatus.Packed, OrderStatus.Refunded },
        [OrderStatus.Packed]    = new[] { OrderStatus.Shipped },
        [OrderStatus.Shipped]   = new[] { OrderStatus.Delivered },
        [OrderStatus.Delivered] = Array.Empty<OrderStatus>(),
        [OrderStatus.Cancelled] = Array.Empty<OrderStatus>(),
        [OrderStatus.Refunded]  = Array.Empty<OrderStatus>()
    };

    private static bool CanTransition(OrderStatus from, OrderStatus to) =>
        _next.TryGetValue(from, out var allowed) && allowed.Contains(to);

    public Order CreateFromCart(string cartId, Cart cart, Customer? customer)
    {
        // Sepeti siparişe kopyala (özet)
        var o = new Order
        {
            CartId   = cartId,
            Customer = customer,
            Items    = cart.Items.Select(ci => new OrderItem
            {
                ProductId = ci.ProductId,
                Title     = ci.Title,
                ImageUrl  = ci.ImageUrl,
                UnitPrice = ci.UnitPrice,
                Qty       = ci.Qty
            }).ToList(),
            Status   = OrderStatus.Created,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Order.Id, modeldeki default ctor ile zaten üretiliyor (ord_...).
        _store[o.Id] = o;
        return o;
    }

    public Order? Get(string id)
        => _store.TryGetValue(id, out var o) ? o : null;

    public Order? UpdateStatus(string id, OrderStatus status)
    {
        if (!_store.TryGetValue(id, out var order)) return null;

        if (!CanTransition(order.Status, status))
            throw new InvalidOperationException("Invalid state transition"); // GlobalException → 409

        order.Status   = status;
        order.UpdatedAt = DateTime.UtcNow;
        _store[id] = order;

        return order;
    }

    // Basit yardımcı: ödemeyi işaretle (Created → Paid)
    public Order? MarkPaid(string id, string transactionId)
    {
        if (!_store.TryGetValue(id, out var o)) return null;

        if (!CanTransition(o.Status, OrderStatus.Paid))
            throw new InvalidOperationException("Invalid state transition");

        o.Status     = OrderStatus.Paid;
        o.PaymentId  = transactionId;
        o.UpdatedAt  = DateTime.UtcNow;
        _store[id] = o;

        return o;
    }
}
