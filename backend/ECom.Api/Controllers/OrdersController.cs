using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

using ECom.Api.Middlewares;
using ECom.Api.Models;                    // Order (eski model)
using ECom.Api.Models.Orders;            // Yeni enum
using ECom.Api.Services;                 // ICartService, CRUD IOrderService
using ECom.Api.Services.Orders;          // IOrderStateService
using ECom.Api.Services.Observability;   // IEventLogger
using OrderModel = ECom.Api.Models.Order;
using OrderStatusNew = ECom.Api.Models.Orders.OrderStatus;

namespace ECom.Api.Controllers;

[ApiController]
// İki route birden: /api/orders ve /api/v1/orders
[Route("api/[controller]")]
[Route("api/v1/[controller]")]
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

    /* -------------------- DTO'lar -------------------- */
    // Listeleme sorgusu
    public sealed record OrderQuery(
        string? q,
        string? status,
        string? from,
        string? to,
        int page = 1,
        int pageSize = 10,
        string? sort = "-createdAt"
    );

    // Frontend tablo özeti
    public sealed record OrderSummary(
        string id,
        string? customerName,
        string? customerEmail,
        decimal total,
        string status,
        DateTime createdAt
    );

    // Paginated cevap şeması (JSON alanları: items/page/pageSize/total)
    public sealed record Paginated<T>(IEnumerable<T> items, int page, int pageSize, int total);

    // Create DTO
    public sealed record CreateOrderDto(string CartId, Customer? Customer);

    // Status change body
    public sealed record ChangeStatusRequest(string To);

    /* -------------------- LIST & SEARCH -------------------- */
    // GET /api/orders?page=...&pageSize=...&q=...
    [HttpGet]
    [Authorize] // gerekirse policy: OrdersManage
    public ActionResult<Paginated<OrderSummary>> List([FromQuery] OrderQuery q)
    {
        // Şimdilik boş veri dönelim ki 200 olsun (ileride _orders ile gerçek listeye bağlanır)
        var result = new Paginated<OrderSummary>(
            Enumerable.Empty<OrderSummary>(),
            q.page,
            q.pageSize,
            0
        );
        return Ok(result);
    }

    // POST /api/orders/search  → Frontend’in 405 aldığı yer için
    [HttpPost("search")]
    [Authorize] // gerekirse policy: OrdersManage
    public ActionResult<Paginated<OrderSummary>> Search([FromBody] OrderQuery q)
        => List(q);

    /* -------------------- CREATE -------------------- */
    // POST /api/orders
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

    /* -------------------- READ -------------------- */
    // GET /api/orders/{id}
    [HttpGet("{id}")]
    [Authorize]
    public ActionResult<OrderModel> Get(string id)
    {
        var o = _orders.Get(id);
        return o is null ? NotFound() : Ok(o);
    }

    /* -------------------- UPDATE STATUS -------------------- */
    // PUT /api/orders/{id}/status
    [HttpPut("{id}/status")]
    [Authorize(Policy = "OrdersManage")]
    public async Task<IActionResult> ChangeStatus(
        string id,
        [FromBody] ChangeStatusRequest body,
        CancellationToken ct)
    {
        if (!Enum.TryParse<OrderStatusNew>(body.To, ignoreCase: true, out var to))
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
