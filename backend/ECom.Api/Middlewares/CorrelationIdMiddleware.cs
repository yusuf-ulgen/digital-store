using System.Diagnostics;

namespace ECom.Api.Middlewares;

public class CorrelationIdMiddleware
{
    public const string HeaderName = "X-Correlation-Id";
    private readonly RequestDelegate _next;

    public CorrelationIdMiddleware(RequestDelegate next) => _next = next;

    public async Task Invoke(HttpContext ctx, ILogger<CorrelationIdMiddleware> logger)
    {
        var cid = ctx.Request.Headers.TryGetValue(HeaderName, out var h) && !string.IsNullOrWhiteSpace(h)
            ? h.ToString()
            : Guid.NewGuid().ToString("N");

        ctx.Response.Headers[HeaderName] = cid;
        ctx.Items[HeaderName] = cid;

        using (logger.BeginScope(new Dictionary<string, object> { ["CorrelationId"] = cid }))
        {
            var sw = Stopwatch.StartNew();
            await _next(ctx);
            sw.Stop();
            logger.LogInformation("HTTP {Method} {Path} -> {Status} ({Ms} ms)",
                ctx.Request.Method, ctx.Request.Path, ctx.Response?.StatusCode, sw.ElapsedMilliseconds);
        }
    }
}
