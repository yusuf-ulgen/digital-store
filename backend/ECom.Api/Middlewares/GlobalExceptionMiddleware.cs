using System.Net;
using Microsoft.AspNetCore.Mvc;

namespace ECom.Api.Middlewares;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    public GlobalExceptionMiddleware(RequestDelegate next) => _next = next;

    public async Task Invoke(HttpContext ctx, ILogger<GlobalExceptionMiddleware> logger)
    {
        try
        {
            await _next(ctx);
        }
        catch (Exception ex)
        {
            var cid = ctx.Items[CorrelationIdMiddleware.HeaderName]?.ToString() ?? ctx.TraceIdentifier;
            var (status, title) = MapStatus(ex);

            logger.LogError(ex, "Unhandled exception (cid={cid})", cid);

            var problem = new ProblemDetails
            {
                Title = title,
                Status = (int)status,
                Type = $"https://httpstatuses.com/{(int)status}",
                Detail = ex is InvalidOperationException ? ex.Message : null,
                Extensions = { ["correlationId"] = cid }
            };

            ctx.Response.ContentType = "application/problem+json";
            ctx.Response.StatusCode = (int)status;
            await ctx.Response.WriteAsJsonAsync(problem);
        }
    }

    private static (HttpStatusCode, string) MapStatus(Exception ex) =>
        ex switch
        {
            UnauthorizedAccessException => (HttpStatusCode.Unauthorized, "Unauthorized"),
            KeyNotFoundException        => (HttpStatusCode.NotFound, "Not Found"),
            InvalidOperationException   => (HttpStatusCode.Conflict, "Conflict"),
            ArgumentException           => (HttpStatusCode.BadRequest, "Bad Request"),
            _                           => (HttpStatusCode.InternalServerError, "Internal Server Error")
        };
}
