namespace ECom.Api.Services.Observability;

public interface IEventLogger
{
    Task WriteAsync<T>(T @event, CancellationToken ct = default);
}
