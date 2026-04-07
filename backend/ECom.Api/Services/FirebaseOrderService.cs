using ECom.Api.Models;
using Google.Cloud.Firestore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace ECom.Api.Services;

public class FirebaseOrderService : IOrderService
{
    private readonly FirestoreDb _db;
    private readonly CollectionReference _ordersCollection;

    public FirebaseOrderService(FirestoreDb db)
    {
        _db = db;
        _ordersCollection = _db.Collection("orders");
    }

    public async Task<List<Order>> GetAllAsync(CancellationToken ct = default)
    {
        var snapshot = await _ordersCollection.OrderByDescending("createdAt").GetSnapshotAsync(ct);
        return snapshot.Documents.Select(doc => MapToOrder(doc)).ToList();
    }

    public async Task<OrderDto> CreateManualAsync(CreateOrderDto dto, CancellationToken ct)
    {
        var order = new Order
        {
            Customer = new Customer
            {
                Email = dto.CustomerEmail,
                Name = dto.CustomerName,
                Address = dto.CustomerAddress
            },
            Items = dto.Items.Select(item => new OrderItem
            {
                ProductId = item.ProductId,
                Title = item.Title,
                ImageUrl = item.ImageUrl,
                UnitPrice = item.UnitPrice,
                Qty = item.Qty
            }).ToList(),
            Status = OrderStatus.Created,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var data = MapFromOrder(order);
        await _ordersCollection.Document(order.Id).SetAsync(data, cancellationToken: ct);

        return new OrderDto(
            order.Id,
            order.Status.ToString(),
            order.Total,
            order.CreatedAt
        );
    }

    public Order? Get(string id)
    {
        // Not: Interface Task değil, bu yüzden senkron gibi duruyor ama Firestore asenkron.
        // Genelde bu tip durumlarda .GetAwaiter().GetResult() kullanılır veya interface Task'a çekilir.
        // Bu projede mevcut imzayı bozmamak için asenkron versiyonu aşağıda helper olarak tanımlayalım.
        var doc = _ordersCollection.Document(id).GetSnapshotAsync().GetAwaiter().GetResult();
        return doc.Exists ? MapToOrder(doc) : null;
    }

    public Order CreateFromCart(string cartId, Cart cart, Customer? customer)
    {
        var order = new Order
        {
            CartId = cartId,
            Customer = customer,
            Items = cart.Items.Select(i => new OrderItem
            {
                ProductId = i.ProductId,
                Title = i.Title,
                ImageUrl = i.ImageUrl,
                UnitPrice = i.Price,
                Qty = i.Qty
            }).ToList()
        };

        var data = MapFromOrder(order);
        _ordersCollection.Document(order.Id).SetAsync(data).GetAwaiter().GetResult();
        return order;
    }

    public Order? UpdateStatus(string id, OrderStatus status)
    {
        var docRef = _ordersCollection.Document(id);
        var snapshot = docRef.GetSnapshotAsync().GetAwaiter().GetResult();
        if (!snapshot.Exists) return null;

        var order = MapToOrder(snapshot);
        order.Status = status;
        order.UpdatedAt = DateTime.UtcNow;

        docRef.UpdateAsync(new Dictionary<string, object>
        {
            { "status", status.ToString() },
            { "updatedAt", Timestamp.FromDateTime(order.UpdatedAt) }
        }).GetAwaiter().GetResult();

        return order;
    }

    public Order? MarkPaid(string id, string transactionId)
    {
        var docRef = _ordersCollection.Document(id);
        var snapshot = docRef.GetSnapshotAsync().GetAwaiter().GetResult();
        if (!snapshot.Exists) return null;

        docRef.UpdateAsync(new Dictionary<string, object>
        {
            { "status", OrderStatus.Paid.ToString() },
            { "paymentId", transactionId },
            { "updatedAt", Timestamp.FromDateTime(DateTime.UtcNow) }
        }).GetAwaiter().GetResult();

        return Get(id);
    }

    // --- MAPPING HELPERS ---

    private static Order MapToOrder(DocumentSnapshot doc)
    {
        var data = doc.ToDictionary();
        var order = new Order
        {
            Id = doc.Id,
            Status = Enum.TryParse<OrderStatus>(data.GetValueOrDefault("status")?.ToString(), out var s) ? s : OrderStatus.Created,
            PaymentId = data.GetValueOrDefault("paymentId")?.ToString(),
            CartId = data.GetValueOrDefault("cartId")?.ToString()
        };

        if (data.TryGetValue("createdAt", out var ca) && ca is Timestamp tca) order.CreatedAt = tca.ToDateTime();
        if (data.TryGetValue("updatedAt", out var ua) && ua is Timestamp tua) order.UpdatedAt = tua.ToDateTime();

        if (data.TryGetValue("customer", out var custObj) && custObj is Dictionary<string, object> custDic)
        {
            order.Customer = new Customer
            {
                Name = custDic.GetValueOrDefault("name")?.ToString(),
                Email = custDic.GetValueOrDefault("email")?.ToString(),
                Address = custDic.GetValueOrDefault("address")?.ToString()
            };
        }

        if (data.TryGetValue("items", out var itemsObj) && itemsObj is IEnumerable<object> itemsList)
        {
            order.Items = itemsList.Select(i => {
                var d = (Dictionary<string, object>)i;
                return new OrderItem
                {
                    ProductId = d.GetValueOrDefault("productId")?.ToString() ?? "",
                    Title = d.GetValueOrDefault("title")?.ToString() ?? "",
                    ImageUrl = d.GetValueOrDefault("imageUrl")?.ToString() ?? "",
                    UnitPrice = Convert.ToDecimal(d.GetValueOrDefault("unitPrice") ?? 0),
                    Qty = Convert.ToInt32(d.GetValueOrDefault("qty") ?? 0)
                };
            }).ToList();
        }

        return order;
    }

    private static Dictionary<string, object> MapFromOrder(Order order)
    {
        return new Dictionary<string, object>
        {
            { "status", order.Status.ToString() },
            { "createdAt", Timestamp.FromDateTime(order.CreatedAt.ToUniversalTime()) },
            { "updatedAt", Timestamp.FromDateTime(order.UpdatedAt.ToUniversalTime()) },
            { "cartId", order.CartId ?? "" },
            { "paymentId", order.PaymentId ?? "" },
            { "customer", new Dictionary<string, object> {
                { "name", order.Customer?.Name ?? "" },
                { "email", order.Customer?.Email ?? "" },
                { "address", order.Customer?.Address ?? "" }
            }},
            { "items", order.Items.Select(i => new Dictionary<string, object> {
                { "productId", i.ProductId },
                { "title", i.Title },
                { "imageUrl", i.ImageUrl },
                { "unitPrice", i.UnitPrice },
                { "qty", i.Qty }
            }).ToList()}
        };
    }
}