using ECom.Api.Models;

namespace ECom.Api.Services;

public interface IProductStore
{
    IEnumerable<Product> GetAll();
    Product? Get(string id);
    Product Add(string title, decimal price, int stock, string? imageUrl);
    Product? Update(string id, string title, decimal price, int stock, string? imageUrl);
    bool Delete(string id);
}
