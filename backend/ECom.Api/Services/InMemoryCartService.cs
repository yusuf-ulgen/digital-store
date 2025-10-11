using System.Collections.Concurrent;
using System.Linq;
using ECom.Api.Models;

namespace ECom.Api.Services;

public class InMemoryCartService : ICartService
{
    private readonly ConcurrentDictionary<string, Cart> _carts = new();

    public Cart GetOrCreate(string cartId) =>
        _carts.GetOrAdd(cartId, _ => new Cart { Id = cartId });

    public Cart Get(string cartId) =>
        _carts.TryGetValue(cartId, out var c) ? c : new Cart { Id = cartId };

    public Cart AddItem(string cartId, Product p, int qty)
    {
        var cart = GetOrCreate(cartId);
        var pid  = p.Id; // string
        var line = cart.Items.FirstOrDefault(i => i.ProductId == pid);

        if (line is null)
        {
            cart.Items.Add(new CartItem
            {
                ProductId = pid,
                Title     = p.Title,
                ImageUrl  = p.ImageUrl,
                UnitPrice = p.Price,              // Product.Price decimal → sorunsuz
                Qty       = Math.Max(1, qty)
            });
        }
        else
        {
            line.Qty += Math.Max(1, qty);
        }
        return cart;
    }

    public Cart SetQty(string cartId, string productId, int qty)
    {
        var cart = GetOrCreate(cartId);
        var line = cart.Items.FirstOrDefault(i => i.ProductId == productId);
        if (line != null)
        {
            line.Qty = qty;
            if (line.Qty <= 0) cart.Items.Remove(line);
        }
        return cart;
    }

    public Cart RemoveItem(string cartId, string productId)
    {
        var cart = GetOrCreate(cartId);
        cart.Items.RemoveAll(i => i.ProductId == productId);
        return cart;
    }

    public void Clear(string cartId) => _carts.TryRemove(cartId, out _);
}
