using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

using ECom.Api.Middlewares;
using ECom.Api.Models;                    // Order (eski model)
using ECom.Api.Models.Orders;            // Yeni enum
using ECom.Api.Services;                 // mevcut IOrderService (CRUD)
using ECom.Api.Services.Orders;          // IOrderStateService
using ECom.Api.Services.Observability;   // IEventLogger
using OrderModel = ECom.Api.Models.Order;
using OrderStatusNew = ECom.Api.Models.Orders.OrderStatus;

namespace ECom.Api.Controllers;

[ApiController]
[Route("api/orders")]
public sealed class OrdersController : ControllerBase
{
    private readonly ICartService _carts;
    private readonly ECom.Api.Services.IOrderService _orders; // CRUD
    private readonly IOrderStateService _orderState;          // state machine
    private readonly IEventLogger _events;

    public OrdersController(
        ICartService carts,
        ECom.Api.Services.IOrderService orders,
        IOrderStateService orderState,
        IEventLogger events)
    {
        _carts = carts;
        _orders = orders;
        _orderState = orderState;
        _events = events;
    }

    // ---- DTO'lar ----
    public sealed record CreateOrderDto(string CartId, Customer? Customer);
    public sealed record ChangeStatusRequest(string To);

    // ---- CREATE (Customer) ----
    [HttpPost]
    [Authorize(Policy = "CartCheckout")]
    public ActionResult<OrderModel> Create([FromBody] CreateOrderDto body)
    {
        var cart = _carts.Get(body.CartId);
        if (cart is null) return NotFound(new { message = "Cart not found" });
        if (cart.Items.Count == 0) return BadRequest(new { message = "Cart is empty" });

        var order = _orders.CreateFromCart(body.CartId, cart, body.Customer);
        _carts.Clear(body.CartId);
        return Ok(order);
    }

    // ---- READ (Genel auth) ----
    [HttpGet("{id}")]
    [Authorize]
    public ActionResult<OrderModel> Get(string id)
    {
        var o = _orders.Get(id);
        return o is null ? NotFound() : Ok(o);
    }

    // ---- UPDATE STATUS (Admin/Staff) ----
    [HttpPut("{id}/status")]
    [Authorize(Policy = "OrdersManage")]
    public async Task<IActionResult> ChangeStatus(
        string id,
        [FromBody] ChangeStatusRequest body,
        CancellationToken ct)
    {
        // Yeni enum ile parse (ambiguous hatasını böyle bitiriyoruz)
        if (!System.Enum.TryParse<OrderStatusNew>(body.To, ignoreCase: true, out var to))
        {
            return Problem(
                title: "ValidationError",
                detail: $"Unknown status '{body.To}'",
                statusCode: StatusCodes.Status400BadRequest);
        }

        // CorrelationId: middleware → header → trace
        var correlationId =
            HttpContext.Items[CorrelationIdMiddleware.HeaderName]?.ToString()
            ?? Request.Headers["X-Correlation-Id"].FirstOrDefault()
            ?? HttpContext.TraceIdentifier;

        var userId =
            User.FindFirst("user_id")?.Value ??
            User.FindFirst("sub")?.Value ??
            User.Identity?.Name;

        try
        {
            var updated = await _orderState.ChangeStatusAsync(id, to, userId, correlationId, ct);

            // NOT: Servis zaten OrderStatusChanged event’ini yazıyor.
            // Burada ikinci kez log yazmıyoruz; böylece enum dönüştürme hataları da biter.

            return Ok(new { updated.Id, Status = updated.Status.ToString() });
        }
        catch (InvalidStateTransitionException ex)
        {
            return Problem(
                title: "InvalidStateTransition",
                detail: ex.Message,
                statusCode: StatusCodes.Status409Conflict);
        }
        catch (KeyNotFoundException)
        {
            return Problem(
                title: "NotFound",
                detail: $"Order {id} not found",
                statusCode: StatusCodes.Status404NotFound);
        }
    }
}
