using ECom.Api.Models;

namespace ECom.Api.Services;

public interface IProductStore
{
    IEnumerable<Product> GetAll();
    Product? Get(Guid id);
    Product Add(Product p);
    bool Update(Guid id, Product p);
    bool Delete(Guid id);
}

public class InMemoryProductStore : IProductStore
{
    private readonly List<Product> _items = new()
    {
        new Product{ Name="Test Ürün 1", Price=199.90m, Description="Demo"},
        new Product{ Name="Test Ürün 2", Price=349.00m}
    };

    public IEnumerable<Product> GetAll() => _items;
    public Product? Get(Guid id) => _items.FirstOrDefault(x => x.Id == id);

    public Product Add(Product p)
    {
        p.Id = Guid.NewGuid();
        _items.Add(p);
        return p;
    }

    public bool Update(Guid id, Product p)
    {
        var i = _items.FindIndex(x => x.Id == id);
        if (i < 0) return false;
        _items[i].Name = p.Name;
        _items[i].Price = p.Price;
        _items[i].Description = p.Description;
        return true;
    }

    public bool Delete(Guid id)
    {
        var e = Get(id);
        if (e is null) return false;
        return _items.Remove(e);
    }
}
