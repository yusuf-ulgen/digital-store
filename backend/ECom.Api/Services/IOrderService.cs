using ECom.Api.Models;

namespace ECom.Api.Services;

public interface IOrderService
{
    Order CreateFromCart(string cartId, Cart cart, Customer? customer);
    Order? Get(string id);

    // Durum güncelleme (biz ekledik)
    Order? UpdateStatus(string id, OrderStatus status);

    // Arayüzde zaten var (hata bundan geliyor)
    Order? MarkPaid(string id, string transactionId);
}
