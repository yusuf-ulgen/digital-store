using Microsoft.AspNetCore.Mvc;
using ECom.Api.Services.Observability;

namespace ECom.Api.Controllers;

[ApiController]
[Route("api/_events")]
public sealed class EventsController : ControllerBase
{
    [HttpGet]
    public IActionResult Get() => Ok(InMemoryEventLogger.ReadAll());
}
