using System.Collections.Concurrent;
using System.Linq;
using ECom.Api.Models;
using ECom.Api.Controllers.Admin;

namespace ECom.Api.Services;

public class InMemoryOrderService : IOrderService
{
    // Order entity'leri için
    private static readonly ConcurrentDictionary<string, Order> _store = new();

    // Geçiş tablosu
    private static readonly Dictionary<OrderStatus, OrderStatus[]> _next = new()
    {
        [OrderStatus.Created]   = new[] { OrderStatus.Paid, OrderStatus.Packed, OrderStatus.Cancelled },
        [OrderStatus.Paid]      = new[] { OrderStatus.Packed, OrderStatus.Refunded },
        [OrderStatus.Packed]    = new[] { OrderStatus.Shipped },
        [OrderStatus.Shipped]   = new[] { OrderStatus.Delivered },
        [OrderStatus.Delivered] = Array.Empty<OrderStatus>(),
        [OrderStatus.Cancelled] = Array.Empty<OrderStatus>(),
        [OrderStatus.Refunded]  = Array.Empty<OrderStatus>()
    };

    private static bool CanTransition(OrderStatus from, OrderStatus to) => _next.TryGetValue(from, out var allowed) && allowed.Contains(to);

    // Tüm siparişleri getir
    public Task<List<Order>> GetAllAsync(CancellationToken ct = default)
    {
        return Task.FromResult(_store.Values.OrderByDescending(o => o.CreatedAt).ToList());
    }

    // Manuel sipariş oluşturma (Admin için)
    public async Task<OrderDto> CreateManualAsync(CreateOrderDto dto, CancellationToken ct)
    {
        var order = new Order
        {
            Customer = new Customer
            {
                Email = dto.CustomerEmail,
                Name = dto.CustomerName,
                Address = dto.CustomerAddress
            },
            Items = dto.Items.Select(item => new OrderItem
            {
                ProductId = item.ProductId,
                Title = item.Title,
                ImageUrl = item.ImageUrl,
                UnitPrice = item.UnitPrice,
                Qty = item.Qty
            }).ToList(),
            Status = OrderStatus.Created,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _store[order.Id] = order;

        return await Task.FromResult(new OrderDto(
            order.Id,
            order.Status.ToString(),
            order.Total,
            order.CreatedAt
        ));
    }

    // Sepetten sipariş oluştur
    public Order CreateFromCart(string cartId, Cart cart, Customer? customer)
    {
        var o = new Order
        {
            CartId    = cartId,
            Customer  = customer,
            Items     = cart.Items.Select(ci => new OrderItem
            {
                ProductId = ci.ProductId,
                Title     = ci.Title,
                ImageUrl  = ci.ImageUrl,
                UnitPrice = ci.UnitPrice,
                Qty       = ci.Qty
            }).ToList(),
            Status    = OrderStatus.Created,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _store[o.Id] = o;
        return o;
    }

    // Sipariş getir
    public Order? Get(string id)
        => _store.TryGetValue(id, out var o) ? o : null;

    // Sipariş durumu güncelle
    public Order? UpdateStatus(string id, OrderStatus status)
    {
        if (!_store.TryGetValue(id, out var order)) return null;

        if (!CanTransition(order.Status, status))
            throw new InvalidOperationException("Invalid state transition");

        order.Status    = status;
        order.UpdatedAt = DateTime.UtcNow;
        _store[id]      = order;

        return order;
    }

    // Ödeme işaretle
    public Order? MarkPaid(string id, string transactionId)
    {
        if (!_store.TryGetValue(id, out var o)) return null;

        if (!CanTransition(o.Status, OrderStatus.Paid))
            throw new InvalidOperationException("Invalid state transition");

        o.Status = OrderStatus.Paid;
        o.PaymentId = transactionId;
        o.UpdatedAt = DateTime.UtcNow;
        _store[id] = o;

        return o;
    }
}