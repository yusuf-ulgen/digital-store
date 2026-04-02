using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Google.Cloud.Firestore;
using ECom.Api.Models;

namespace ECom.Api.Services.Inventory;

public sealed class FirestoreInventoryService : IInventoryService
{
    private readonly FirestoreDb _db;
    private readonly IOrderService _orderService;

    public FirestoreInventoryService(FirestoreDb db, IOrderService orderService)
    {
        _db = db;
        _orderService = orderService;
    }

    public Task ReserveOnCreatedAsync(string orderId, CancellationToken ct = default) => Task.CompletedTask;

    public async Task CommitOnPaidAsync(string orderId, CancellationToken ct = default)
    {
        var order = _orderService.Get(orderId);
        if (order == null || order.Items == null) return;

        foreach (var item in order.Items)
        {
            await UpdateStockAsync(item.ProductId, -item.Quantity, ct);
        }
    }

    public async Task RevertOnCanceledOrRefundedAsync(string orderId, CancellationToken ct = default)
    {
        var order = _orderService.Get(orderId);
        if (order == null || order.Items == null) return;

        foreach (var item in order.Items)
        {
            await UpdateStockAsync(item.ProductId, item.Quantity, ct);
        }
    }

    private async Task UpdateStockAsync(string productId, int delta, CancellationToken ct)
    {
        try
        {
            var docRef = _db.Collection("products").Document(productId);
            await _db.RunTransactionAsync(async transaction =>
            {
                var snapshot = await transaction.GetSnapshotAsync(docRef, ct);
                if (!snapshot.Exists) return;

                var currentStock = snapshot.GetValue<int>("stock");
                var newStock = Math.Max(0, currentStock + delta);

                transaction.Update(docRef, new Dictionary<string, object>
                {
                    { "stock", newStock }
                });
            });
        }
        catch (Exception ex)
        {
            // Log error or handle gracefully
            Console.WriteLine($"[Inventory] Error updating stock for {productId}: {ex.Message}");
        }
    }
}
