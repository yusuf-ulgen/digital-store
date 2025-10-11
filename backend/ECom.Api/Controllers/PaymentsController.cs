using ECom.Api.Models;
using ECom.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace ECom.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly IOrderService _orders;
    private readonly IPaymentService _payments;

    public PaymentsController(IOrderService orders, IPaymentService payments)
    {
        _orders = orders;
        _payments = payments;
    }

    [HttpPost("simulate")]
    public ActionResult<PaymentResult> Simulate([FromBody] PaymentRequest req)
    {
        var order = _orders.Get(req.OrderId);
        if (order is null) return NotFound(new { message = "Order not found" });

        var res = _payments.Simulate(req, order);
        if (!res.Success) return BadRequest(res);

        _orders.MarkPaid(order.Id, res.PaymentId);
        return Ok(res);
    }
}
