using ECom.Api.Models;

namespace ECom.Api.Services;

public interface ICartService
{
    Cart GetOrCreate(string cartId);
    Cart Get(string cartId);
    Cart AddItem(string cartId, Models.Product product, int qty);
    Cart SetQty(string cartId, string productId, int qty);
    Cart RemoveItem(string cartId, string productId);
    void Clear(string cartId);
}
