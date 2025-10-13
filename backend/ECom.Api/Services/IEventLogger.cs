namespace ECom.Api.Services;

public interface IEventLogger
{
    Task LogAsync(EventLog evt, CancellationToken ct = default);
}

public record EventLog(
    DateTimeOffset At,
    string Type,
    string? OrderId = null,
    string? OldStatus = null,
    string? NewStatus = null,
    string? UserId = null,
    string? CorrelationId = null,
    object? Data = null
);
