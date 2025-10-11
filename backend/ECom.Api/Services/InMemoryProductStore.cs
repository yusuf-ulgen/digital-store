using System.Collections.Concurrent;
using System.Linq;
using ECom.Api.Models;

namespace ECom.Api.Services;

public class InMemoryProductStore : IProductStore
{
    private readonly ConcurrentDictionary<string, Product> _db = new();

    public InMemoryProductStore()
    {
        // örnek veriler
        Add("Şef Bıçağı Santoku Paslanmaz Çelik", 599m,    8, "/images/p1.jpg");
        Add("100. YILA ÖZEL ŞEF BIÇAĞI",          449.90m, 5, "/images/p2.jpg");
        Add("Şef Bıçağı Santoku Paslanmaz Çelik", 599m,    0, "/images/p3.jpg");
    }

    public IEnumerable<Product> GetAll() => _db.Values.OrderBy(x => x.Title);

    public Product? Get(string id) => _db.TryGetValue(id, out var p) ? p : null;

    public Product Add(string title, decimal price, int stock, string? imageUrl)
    {
        var p = new Product
        {
            Id       = Guid.NewGuid().ToString("N"),  // Guid → string
            Title    = title,
            Price    = price,                          // decimal
            Stock    = stock,
            ImageUrl = imageUrl
        };
        _db[p.Id] = p;                                // Key/Normalize yok
        return p;
    }

    public Product? Update(string id, string title, decimal price, int stock, string? imageUrl)
    {
        if (!_db.TryGetValue(id, out var p)) return null;
        p.Title    = title;
        p.Price    = price;                           // decimal
        p.Stock    = stock;
        p.ImageUrl = imageUrl;
        return p;
    }

    public bool Delete(string id) => _db.TryRemove(id, out _);
}
