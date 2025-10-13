using System.Collections.Concurrent;

namespace ECom.Api.Services;

public class InMemoryEventLogger : IEventLogger
{
    private static readonly ConcurrentQueue<EventLog> _events = new();

    public Task LogAsync(EventLog evt, CancellationToken ct = default)
    {
        _events.Enqueue(evt);
        return Task.CompletedTask;
    }

    // Debug amaçlı: son N kayıt
    public static IEnumerable<EventLog> GetLast(int n = 100) => _events.Reverse().Take(n);
}
