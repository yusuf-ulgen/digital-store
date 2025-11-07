using ECom.Api.Models;

namespace ECom.Api.Services;

public interface IOrderService
{
    Order CreateFromCart(string cartId, Cart cart, Customer? customer);
    Order? Get(string id);
    Task<List<Order>> GetAllAsync(CancellationToken ct = default);
    Order? UpdateStatus(string id, OrderStatus status);
    Order? MarkPaid(string id, string transactionId);

    // Artık ECom.Api.Models içindeki OrderDto ve CreateOrderDto'yu kullanıyor
    Task<OrderDto> CreateManualAsync(CreateOrderDto dto, CancellationToken ct);
}