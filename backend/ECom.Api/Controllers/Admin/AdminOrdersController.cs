using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ECom.Api.Services;
using ECom.Api.Models; // DTO'lar için bu namespace'i ekliyoruz

namespace ECom.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/orders")]
[Authorize(Policy = "OrdersWrite")] // Admin|Staff
public class AdminOrdersController : ControllerBase
{
    private readonly IOrderService _orders;

    public AdminOrdersController(IOrderService orders)
    {
        _orders = orders;
    }

    // Tüm siparişleri getir
    [HttpGet]
    public async Task<ActionResult<List<OrderListDto>>> GetAll(CancellationToken ct)
    {
        var orders = await _orders.GetAllAsync(ct);
        var orderDtos = orders.Select(o => new OrderListDto(
            o.Id,
            o.Customer?.Name ?? "N/A",
            o.Customer?.Email ?? "N/A",
            o.Status.ToString(),
            o.Total,
            o.CreatedAt
        )).ToList();
        
        return Ok(orderDtos);
    }

    // Tek sipariş detayı
    [HttpGet("{id}")]
    public ActionResult<OrderDetailDto> GetById(string id)
    {
        var order = _orders.Get(id);
        if (order == null)
            return NotFound(new { message = "Sipariş bulunamadı" });

        var dto = new OrderDetailDto(
            order.Id,
            order.Customer,
            order.Items,
            order.Total,
            order.Status.ToString(),
            order.CreatedAt,
            order.UpdatedAt
        );

        return Ok(dto);
    }

    // YENİ SİPARİŞ OLUŞTUR (Bu metot zaten vardı, şimdi kalıcı olacak)
    [HttpPost]
    public async Task<ActionResult<OrderDto>> Create(
        [FromBody] CreateOrderDto dto, CancellationToken ct)
    {
        try
        {
            var createdDto = await _orders.CreateManualAsync(dto, ct);
            return Created($"/api/admin/orders/{createdDto.Id}", createdDto);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "Sipariş oluşturulamadı", error = ex.Message });
        }
    }

    // Sipariş durumunu güncelle
    [HttpPatch("{id}/status")]
    public ActionResult<OrderDto> UpdateStatus(string id, [FromBody] UpdateStatusDto dto)
    {
        if (!Enum.TryParse<OrderStatus>(dto.Status, true, out var status))
        {
            return BadRequest(new { message = "Geçersiz sipariş durumu" });
        }

        var updated = _orders.UpdateStatus(id, status);
        if (updated == null)
            return NotFound(new { message = "Sipariş bulunamadı" });

        return Ok(new OrderDto(
            updated.Id,
            updated.Status.ToString(),
            updated.Total,
            updated.CreatedAt
        ));
    }

    // ---- DTO'lar buradan Models/OrderDtos.cs dosyasına taşındı ----
}