namespace ECom.Api.Models;

public class PaymentRequest
{
    public string OrderId { get; set; } = default!;
    public string Method { get; set; } = "card";
    public decimal Amount { get; set; }
    public string? CardLast4 { get; set; }
}

public class PaymentResult
{
    public string PaymentId { get; set; } = "pay_" + Guid.NewGuid().ToString("N")[..10];
    public bool Success { get; set; }
    public string? Error { get; set; }
}
