using ECom.Api.Models;
// using Google.Cloud.Firestore; // Firebase SDK'nı buraya ekle

namespace ECom.Api.Services;

public class FirebaseOrderService : IOrderService
{
    // private readonly FirestoreDb _firestoreDb;
    // private readonly CollectionReference _ordersCollection;

    public FirebaseOrderService(/* FirestoreDb firestoreDb */)
    {
        // _firestoreDb = firestoreDb;
        // _ordersCollection = _firestoreDb.Collection("orders"); // Koleksiyon adın neyse
    }

    public async Task<List<Order>> GetAllAsync(CancellationToken ct = default)
    {
        // TODO: Firebase'den tüm siparişleri çek
        // Örnek: var snapshot = await _ordersCollection.OrderByDescending("CreatedAt").GetSnapshotAsync(ct);
        // return snapshot.Documents.Select(doc => doc.ConvertTo<Order>()).ToList();
        
        // Şimdilik boş liste dönsün
        return await Task.FromResult(new List<Order>());
    }

    public async Task<OrderDto> CreateManualAsync(CreateOrderDto dto, CancellationToken ct)
    {
        var order = new Order
        {
            // Id, Order constructor'ında otomatik oluşuyor varsayıyorum
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
            Status = OrderStatus.Created, // Manuel girilen sipariş "Oluşturuldu"
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // TODO: Bu 'order' objesini Firebase'e kaydet
        // Örnek: await _ordersCollection.Document(order.Id).SetAsync(order, cancellationToken: ct);

        // Dönen DTO'yu oluştur
        return new OrderDto(
            order.Id,
            order.Status.ToString(),
            order.Total,
            order.CreatedAt
        );
    }
    
    // TODO: Get, UpdateStatus, MarkPaid ve CreateFromCart metotlarının
    // içini de Firebase'e göre doldurman gerekiyor.
    // ...
    
    public Order? Get(string id)
    {
        // TODO: Firebase'den tek sipariş getir
        throw new NotImplementedException();
    }
    
    public Order CreateFromCart(string cartId, Cart cart, Customer? customer)
    {
        // TODO: Sepetten oluşturmayı Firebase'e kaydet
        throw new NotImplementedException();
    }

    public Order? UpdateStatus(string id, OrderStatus status)
    {
        // TODO: Firebase'de durumu güncelle
        throw new NotImplementedException();
    }

    public Order? MarkPaid(string id, string transactionId)
    {
        // TODO: Firebase'de ödeme durumunu güncelle
        throw new NotImplementedException();
    }
}