using ECom.Api.Models;

namespace ECom.Api.Services;

public interface IOrderService
{
    Order CreateFromCart(string cartId, Cart cart, Customer? customer);
    Order? Get(string orderId);
    void MarkPaid(string orderId, string paymentId);
}
