using ECom.Api.Models;

namespace ECom.Api.Services;

public interface IPaymentService
{
    PaymentResult Simulate(PaymentRequest req, Order order);
}
