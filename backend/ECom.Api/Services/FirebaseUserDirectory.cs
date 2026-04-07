using FirebaseAdmin.Auth;
using ECom.Api.Models;             // YENİ MODELLER İÇİN
using ECom.Api.Controllers.Admin;  // IUserDirectory arayüzü için

namespace ECom.Api.Services;

public class FirebaseUserDirectory : IUserDirectory
{
    private readonly FirebaseAuth _auth;

    public FirebaseUserDirectory()
    {
        _auth = FirebaseAuth.DefaultInstance;
    }

    public async Task<Paginated<UserRow>> ListAsync(UserListParams p, CancellationToken ct)
    {
        var allUsers = new List<UserRow>();
        var pagedEnumerable = _auth.ListUsersAsync(null);
        var enumerator = pagedEnumerable.GetAsyncEnumerator(ct);
        
        while (await enumerator.MoveNextAsync())
        {
            allUsers.Add(FirebaseUserToUserRow(enumerator.Current));
        }

        var filtered = allUsers.AsEnumerable();
        if (!string.IsNullOrWhiteSpace(p.Q))
        {
            filtered = filtered.Where(u => 
                u.Email.Contains(p.Q, StringComparison.OrdinalIgnoreCase) ||
                (u.DisplayName != null && u.DisplayName.Contains(p.Q, StringComparison.OrdinalIgnoreCase))
            );
        }
        if (!string.IsNullOrWhiteSpace(p.Role) && p.Role != "All")
        {
            filtered = filtered.Where(u => u.Role.Equals(p.Role, StringComparison.OrdinalIgnoreCase));
        }

        var filteredList = filtered.ToList();
        var total = filteredList.Count;
        var items = filteredList.Skip((p.Page - 1) * p.PageSize).Take(p.PageSize).ToList();

        return new Paginated<UserRow>(items, p.Page, p.PageSize, total);
    }

    public async Task DeleteAsync(string id, CancellationToken ct) => await _auth.DeleteUserAsync(id, ct);

    public async Task<UserRow?> GetByEmailAsync(string email, CancellationToken ct)
    {
        try { return FirebaseUserToUserRow(await _auth.GetUserByEmailAsync(email, ct)); }
        catch (FirebaseAuthException e) when (e.AuthErrorCode == AuthErrorCode.UserNotFound) { return null; }
    }

    public async Task<UserRow?> GetByIdAsync(string id, CancellationToken ct)
    {
        try { return FirebaseUserToUserRow(await _auth.GetUserAsync(id, ct)); }
        catch (FirebaseAuthException e) when (e.AuthErrorCode == AuthErrorCode.UserNotFound) { return null; }
    }

    public async Task PushRoleClaimAsync(string id, string role, CancellationToken ct)
    {
        var user = await _auth.GetUserAsync(id, ct);
        var claims = user.CustomClaims?.ToDictionary(k => k.Key, v => v.Value) ?? new Dictionary<string, object>();
        claims["role"] = role;
        await _auth.SetCustomUserClaimsAsync(id, claims, ct);
    }
    
    public async Task SetRoleAsync(string id, string role, CancellationToken ct) 
    {
        await PushRoleClaimAsync(id, role, ct);
    }


    private static UserRow FirebaseUserToUserRow(UserRecord user)
    {
        string role = "Customer";
        if (user.CustomClaims != null && user.CustomClaims.TryGetValue("role", out var r))
        {
            role = r?.ToString() ?? "Customer";
        }

        return new UserRow
        {
            Id = user.Uid,
            Email = user.Email,
            DisplayName = user.DisplayName,
            Role = role,
            CreatedAt = user.UserMetaData?.CreationTimestamp?.ToString("o"),
            LastLoginAt = user.UserMetaData?.LastSignInTimestamp?.ToString("o")
        };
    }
}