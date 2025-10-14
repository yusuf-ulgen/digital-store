namespace ECom.Api.Services.Inventory;

public interface IInventoryService
{
    Task ReserveOnCreatedAsync(string orderId, CancellationToken ct = default); // varsa
    Task CommitOnPaidAsync(string orderId, CancellationToken ct = default);    // stok düş
    Task RevertOnCanceledOrRefundedAsync(string orderId, CancellationToken ct = default); // stoğa iade
}
