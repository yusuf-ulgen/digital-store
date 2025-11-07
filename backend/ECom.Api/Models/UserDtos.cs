namespace ECom.Api.Models;

// Kullanıcı listeleme parametreleri
public record UserListParams(
    string? Q,
    string? Role,
    int Page = 1,
    int PageSize = 10
);

// Sayfalama yapısı (Generic)
public record Paginated<T>(
    List<T> Items,
    int Page,
    int PageSize,
    int Total
);

// Kullanıcı satırı modeli
public class UserRow
{
    public string Id { get; set; } = default!;
    public string Email { get; set; } = default!;
    public string? DisplayName { get; set; }
    public string Role { get; set; } = "Customer";
    public int OrdersCount { get; set; } = 0;
    public string? LastLoginAt { get; set; }
    public string? CreatedAt { get; set; }
}

// Rol değiştirme DTO'su
public record ChangeRoleDto(string Role);