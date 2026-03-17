namespace Bootcamp.Api.Application;

/// <summary>
/// Contrato para casos de uso relacionados con usuarios.
/// </summary>
public interface IUserService
{
    Task<UserResponse?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<List<UserResponse>> GetAllAsync(int skip, int take, CancellationToken ct);
    Task<UserResponse> CreateAsync(CreateUserRequest request, CancellationToken ct);
    Task<UserResponse> UpdateAsync(Guid id, UpdateUserRequest request, CancellationToken ct);
    Task DeleteAsync(Guid id, CancellationToken ct);
}

/// <summary>
/// DTO de respuesta para usuario.
/// </summary>
public sealed record UserResponse(Guid Id, string Name, string Email, string Status, DateTime CreatedAt, DateTime UpdatedAt);

/// <summary>
/// DTO para crear usuario.
/// </summary>
public sealed record CreateUserRequest(string Name, string Email);

/// <summary>
/// DTO para actualizar usuario (los campos son opcionales).
/// </summary>
public sealed record UpdateUserRequest(string? Name, string? Email, string? Status);
