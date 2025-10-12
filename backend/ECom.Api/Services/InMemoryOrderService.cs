using System.Collections.Concurrent;
using ECom.Api.Models;

namespace ECom.Api.Services;

public class InMemoryOrderService : IOrderService
{
    private static readonly ConcurrentDictionary<string, Order> _store = new();

    public Order CreateFromCart(string cartId, Cart cart, Customer? customer)
    {
        var o = new Order
        {
            Id = Guid.NewGuid().ToString("N"),
            Status = OrderStatus.Created,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _store[o.Id] = o;
        return o;
    }

    public Order? Get(string id)
        => _store.TryGetValue(id, out var o) ? o : null;

    public Order? UpdateStatus(string id, OrderStatus status)
    {
        if (!_store.TryGetValue(id, out var o)) return null;
        o.Status = status;
        o.UpdatedAt = DateTime.UtcNow;
        _store[id] = o;
        return o;
    }

    // ← CS0535'i kapatan implementasyon
    public Order? MarkPaid(string id, string transactionId)
    {
        if (!_store.TryGetValue(id, out var o)) return null;

        // İstersen Created dışındaki bazı durumlarda engelle:
        // if (o.Status != OrderStatus.Created) return null;

        o.Status = OrderStatus.Paid;
        o.UpdatedAt = DateTime.UtcNow;

        // Order modelinde ödeme referansı alanın yoksa bunu sadece logla/geç.
        // Varsa örn: o.PaymentRef = transactionId;

        _store[id] = o;
        return o;
    }
}
