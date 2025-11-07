using ECom.Api.Models;

namespace ECom.Api.Models;

public record CreateOrderDto(
    string CustomerEmail, 
    string? CustomerName, 
    string? CustomerAddress,
    List<OrderItemDto> Items
);

public record OrderItemDto(
    string ProductId, 
    string Title,
    string ImageUrl,
    int Qty, 
    decimal UnitPrice
);

public record OrderDto(
    string Id, 
    string Status, 
    decimal Total, 
    DateTime CreatedAt
);

public record OrderListDto(
    string Id,
    string CustomerName,
    string CustomerEmail,
    string Status,
    decimal Total,
    DateTime CreatedAt
);

public record OrderDetailDto(
    string Id,
    Customer? Customer,
    List<OrderItem> Items,
    decimal Total,
    string Status,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record UpdateStatusDto(string Status);