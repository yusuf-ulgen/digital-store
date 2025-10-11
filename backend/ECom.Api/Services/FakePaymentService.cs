using ECom.Api.Models;

namespace ECom.Api.Services;

public class FakePaymentService : IPaymentService
{
    public PaymentResult Simulate(PaymentRequest req, Order order)
    {
        if (req.Amount != order.Total)
            return new PaymentResult { Success = false, Error = "Amount mismatch" };

        return new PaymentResult { Success = true };
    }
}
