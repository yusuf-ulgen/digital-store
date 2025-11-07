using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECom.Api.Controllers;

[ApiController]
[Route("api/dev")]
public class DevController : ControllerBase
{
    // Basit “canlı mı?” testi (Authorize yok – 200 dönmeli)
    [HttpGet("alive")]
    [AllowAnonymous]
    public IActionResult Alive() => Ok(new { ok = true, time = DateTime.UtcNow });

    [Authorize]
    [HttpGet("me")]
    public IActionResult Me()
    {
        var claims = User.Claims.Select(c => new { c.Type, c.Value });
        return Ok(new {
            name  = User.Identity?.Name,
            role  = User.FindFirstValue(ClaimTypes.Role),
            email = User.FindFirstValue(ClaimTypes.Email),
            claims
        });
    }

    [Authorize]
    [HttpGet("whoami")]
    public IActionResult WhoAmI()
    {
        bool isAdmin = User.IsInRole("Admin");
        bool isStaff = User.IsInRole("Staff");
        var role = User.FindFirstValue(ClaimTypes.Role);
        return Ok(new { role, isAdmin, isStaff });
    }
}