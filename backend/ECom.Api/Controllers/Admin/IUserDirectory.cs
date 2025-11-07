using ECom.Api.Models;

namespace ECom.Api.Controllers.Admin;

public interface IUserDirectory
{
    Task<Paginated<UserRow>> ListAsync(UserListParams p, CancellationToken ct);
    Task<UserRow?> GetByIdAsync(string id, CancellationToken ct);
    Task<UserRow?> GetByEmailAsync(string email, CancellationToken ct);
    Task SetRoleAsync(string id, string role, CancellationToken ct);
    Task PushRoleClaimAsync(string id, string role, CancellationToken ct);
    Task DeleteAsync(string id, CancellationToken ct);
}