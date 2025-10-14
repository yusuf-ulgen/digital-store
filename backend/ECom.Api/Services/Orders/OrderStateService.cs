using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using ECom.Api.Models;                 // Order (eski model)
using ECom.Api.Models.Orders;          // Yeni enum + state machine + event
using ECom.Api.Services.Inventory;
using ECom.Api.Services.Observability;
using OrderModel = ECom.Api.Models.Order;
using OrderStatusNew = ECom.Api.Models.Orders.OrderStatus;
using OrderStatusOld = ECom.Api.Models.OrderStatus;

namespace ECom.Api.Services.Orders;

/// Sipariş durum geçişleri için ayrı servis (eski IOrderService ile çakışmasın diye)
public interface IOrderStateService
{
    Task<OrderModel> ChangeStatusAsync(
        string orderId,
        OrderStatusNew to,
        string? causedByUserId,
        string? correlationId,
        CancellationToken ct = default);
}

public sealed class OrderStateService : IOrderStateService
{
    private readonly ECom.Api.Services.IOrderService _basicOrders; // mevcut CRUD servisin
    private readonly IInventoryService _inventory;
    private readonly IEventLogger _events;

    public OrderStateService(
        ECom.Api.Services.IOrderService basicOrders,
        IInventoryService inventory,
        IEventLogger events)
    {
        _basicOrders = basicOrders;
        _inventory = inventory;
        _events = events;
    }

    // ---- Enum eşleştiriciler (tek kaynak gerçek) ----
    private static OrderStatusNew ToNew(OrderStatusOld v)
        => Enum.TryParse<OrderStatusNew>(v.ToString(), out var r) ? r
           : throw new InvalidOperationException($"Status map (old→new) failed: {v}");

    private static OrderStatusOld ToOld(OrderStatusNew v)
        => Enum.TryParse<OrderStatusOld>(v.ToString(), out var r) ? r
           : throw new InvalidOperationException($"Status map (new→old) failed: {v}");

    public async Task<OrderModel> ChangeStatusAsync(
        string orderId,
        OrderStatusNew to,
        string? causedByUserId,
        string? correlationId,
        CancellationToken ct = default)
    {
        var order = _basicOrders.Get(orderId)
                    ?? throw new KeyNotFoundException($"Order {orderId} not found");

        // Order modelindeki mevcut durum eski enum; new’e çevirip kontrol et.
        var fromOld = order.Status;
        var from = ToNew(fromOld);

        OrderStateMachine.EnsureCanTransition(orderId, from, to);

        // İş kuralları (stok etkileri)
        if (from == OrderStatusNew.Created && to == OrderStatusNew.Paid)
        {
            await _inventory.CommitOnPaidAsync(orderId, ct);
        }
        else if (to is OrderStatusNew.Cancelled or OrderStatusNew.Refunded)
        {
            await _inventory.RevertOnCanceledOrRefundedAsync(orderId, ct);
        }

        // Order modelini güncelle (eski enum ile tutuyoruz)
        order.Status = ToOld(to);

        // Event log (yeni enum ile)
        await _events.WriteAsync(new OrderStatusChanged
        {
            OrderId = order.Id,
            From = from,
            To = to,
            OccurredAt = DateTimeOffset.UtcNow,
            CorrelationId = correlationId,
            CausedByUserId = causedByUserId
        }, ct);

        return order;
    }
}
