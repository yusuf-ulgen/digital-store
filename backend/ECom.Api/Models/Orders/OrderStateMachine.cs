using System.Collections.Generic;
using System.Linq;

namespace ECom.Api.Models.Orders;

public static class OrderStateMachine
{
    private static readonly Dictionary<OrderStatus, OrderStatus[]> Allowed = new()
    {
        [OrderStatus.Created]   = new[] { OrderStatus.Paid, OrderStatus.Cancelled },
        [OrderStatus.Paid]      = new[] { OrderStatus.Packed, OrderStatus.Refunded, OrderStatus.Cancelled },
        [OrderStatus.Packed]    = new[] { OrderStatus.Shipped },
        [OrderStatus.Shipped]   = new[] { OrderStatus.Delivered },
        [OrderStatus.Delivered] = Array.Empty<OrderStatus>(),
        [OrderStatus.Cancelled] = Array.Empty<OrderStatus>(),
        [OrderStatus.Refunded]  = Array.Empty<OrderStatus>(),
    };

    public static bool CanTransition(OrderStatus from, OrderStatus to)
        => Allowed.TryGetValue(from, out var arr) && arr.Contains(to);

    public static void EnsureCanTransition(string orderId, OrderStatus from, OrderStatus to)
    {
        if (!CanTransition(from, to))
            throw new InvalidStateTransitionException(orderId, from, to);
    }
}
