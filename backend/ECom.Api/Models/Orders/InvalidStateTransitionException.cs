namespace ECom.Api.Models.Orders;

public sealed class InvalidStateTransitionException : Exception
{
    public string OrderId { get; }
    public OrderStatus From { get; }
    public OrderStatus To { get; }

    public InvalidStateTransitionException(string orderId, OrderStatus from, OrderStatus to)
        : base($"Invalid state transition {from} -> {to} for order {orderId}")
    {
        OrderId = orderId;
        From = from;
        To = to;
    }
}
