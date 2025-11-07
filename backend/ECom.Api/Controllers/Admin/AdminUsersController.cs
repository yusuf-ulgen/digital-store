using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ECom.Api.Models; // YENİ MODELLER BURADAN GELECEK

namespace ECom.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/users")]
[Authorize(Policy = "UsersRead")]
public class AdminUsersController : ControllerBase
{
    private const string SuperAdminEmail = "admin@example.com";
    private readonly IUserDirectory _users;

    public AdminUsersController(IUserDirectory users) => _users = users;

    [HttpGet]
    [Authorize(Policy = "UsersRead")]
    public async Task<ActionResult<Paginated<UserRow>>> ListUsers(
        [FromQuery] UserListParams p, CancellationToken ct)
    {
        var result = await _users.ListAsync(p, ct);
        return Ok(result);
    }

    [HttpPost("{id}/role")]
    [Authorize(Policy = "UsersWrite")]
    public async Task<IActionResult> ChangeRole(string id, [FromBody] ChangeRoleDto dto, CancellationToken ct)
    {
        var u = await _users.GetByIdAsync(id, ct);
        if (u is null) return NotFound("User not found.");

        if (string.Equals(u.Email, SuperAdminEmail, StringComparison.OrdinalIgnoreCase))
            return Conflict("Süper admin rolü değiştirilemez.");

        var to = dto.Role;
        if (to is not ("Admin" or "Staff" or "Customer"))
            return BadRequest("Invalid role.");

        await _users.SetRoleAsync(id, to, ct);
        await _users.PushRoleClaimAsync(id, to, ct);

        return Ok(new { ok = true });
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "UsersWrite")]
    public async Task<IActionResult> DeleteUser(string id, CancellationToken ct)
    {
        var u = await _users.GetByIdAsync(id, ct);
        if (u is null) return NotFound();
        if (string.Equals(u.Email, SuperAdminEmail, StringComparison.OrdinalIgnoreCase))
            return Conflict("Süper admin silinemez.");
        
        await _users.DeleteAsync(id, ct);
        return NoContent();
    }
}