using System.Collections.Concurrent;

namespace ECom.Api.Services.Observability;

public sealed class InMemoryEventLogger : IEventLogger
{
    private static readonly ConcurrentQueue<object> _events = new();

    public Task WriteAsync<T>(T @event, CancellationToken ct = default)
    {
        _events.Enqueue(@event!);
        return Task.CompletedTask;
    }

    // debug için okuyucu (opsiyonel endpointte kullanacağız)
    public static IEnumerable<object> ReadAll() => _events.ToArray();
}
