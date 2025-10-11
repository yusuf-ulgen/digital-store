namespace ECom.Api.Models;

public record ProductDto(
    string Title,
    decimal Price,          
    int Stock,
    string? ImageUrl
);
