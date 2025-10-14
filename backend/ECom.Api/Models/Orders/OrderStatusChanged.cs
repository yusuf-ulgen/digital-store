namespace ECom.Api.Models.Orders;

public sealed class OrderStatusChanged
{
    public required string OrderId { get; init; }
    public required OrderStatus From { get; init; }
    public required OrderStatus To { get; init; }
    public required DateTimeOffset OccurredAt { get; init; }
    public required string? CorrelationId { get; init; }
    public required string? CausedByUserId { get; init; }
}
