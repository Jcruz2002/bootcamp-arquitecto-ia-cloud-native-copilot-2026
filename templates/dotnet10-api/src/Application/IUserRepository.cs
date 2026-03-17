using Bootcamp.Api.Domain;

namespace Bootcamp.Api.Application;

/// <summary>
/// Contrato para operaciones de persistencia de usuarios.
/// </summary>
public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<List<User>> GetAllAsync(int skip, int take, CancellationToken ct);
    Task<User?> GetByEmailAsync(string email, CancellationToken ct);
    Task<User> CreateAsync(User user, CancellationToken ct);
    Task<User> UpdateAsync(User user, CancellationToken ct);
    Task DeleteAsync(Guid id, CancellationToken ct);
}
