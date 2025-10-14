namespace ECom.Api.Services.Inventory;

public sealed class NoopInventoryService : IInventoryService
{
    public Task ReserveOnCreatedAsync(string orderId, CancellationToken ct = default) => Task.CompletedTask;
    public Task CommitOnPaidAsync(string orderId, CancellationToken ct = default) => Task.CompletedTask;
    public Task RevertOnCanceledOrRefundedAsync(string orderId, CancellationToken ct = default) => Task.CompletedTask;
}
