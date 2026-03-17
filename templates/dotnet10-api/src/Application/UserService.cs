using Bootcamp.Api.Domain;

namespace Bootcamp.Api.Application;

/// <summary>
/// Servicio de casos de uso para usuarios. Contiene lógica de negocio.
/// </summary>
public sealed class UserService : IUserService
{
    private readonly IUserRepository _repository;

    public UserService(IUserRepository repository)
    {
        _repository = repository;
    }

    public async Task<UserResponse?> GetByIdAsync(Guid id, CancellationToken ct)
    {
        if (id == Guid.Empty)
            return null;

        var user = await _repository.GetByIdAsync(id, ct);
        return user is null ? null : MapToResponse(user);
    }

    public async Task<List<UserResponse>> GetAllAsync(int skip, int take, CancellationToken ct)
    {
        if (skip < 0) skip = 0;
        if (take <= 0) take = 10;
        if (take > 100) take = 100;

        var users = await _repository.GetAllAsync(skip, take, ct);
        return users.Select(MapToResponse).ToList();
    }

    public async Task<UserResponse> CreateAsync(CreateUserRequest request, CancellationToken ct)
    {
        ValidateUserInput(request.Name, request.Email);

        var existing = await _repository.GetByEmailAsync(request.Email, ct);
        if (existing is not null)
            throw new InvalidOperationException("Email ya existe.");

        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Email = request.Email,
            Status = "active",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var created = await _repository.CreateAsync(user, ct);
        return MapToResponse(created);
    }

    public async Task<UserResponse> UpdateAsync(Guid id, UpdateUserRequest request, CancellationToken ct)
    {
        var user = await _repository.GetByIdAsync(id, ct);
        if (user is null)
            throw new InvalidOperationException("Usuario no encontrado.");

        // Actualizar solo los campos que se proporcionaron
        if (!string.IsNullOrWhiteSpace(request.Name))
        {
            if (request.Name.Length < 3)
                throw new InvalidOperationException("Nombre debe tener al menos 3 caracteres.");
            user.Name = request.Name;
        }

        if (!string.IsNullOrWhiteSpace(request.Email))
        {
            if (!request.Email.Contains("@"))
                throw new InvalidOperationException("Email inválido.");

            if (user.Email != request.Email)
            {
                var existing = await _repository.GetByEmailAsync(request.Email, ct);
                if (existing is not null)
                    throw new InvalidOperationException("Email ya existe.");
            }
            user.Email = request.Email;
        }

        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            if (request.Status != "active" && request.Status != "inactive")
                throw new InvalidOperationException("Status debe ser 'active' o 'inactive'.");
            user.Status = request.Status;
        }

        user.UpdatedAt = DateTime.UtcNow;
        var updated = await _repository.UpdateAsync(user, ct);
        return MapToResponse(updated);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var user = await _repository.GetByIdAsync(id, ct);
        if (user is null)
            throw new InvalidOperationException("Usuario no encontrado.");

        await _repository.DeleteAsync(id, ct);
    }

    private static void ValidateUserInput(string name, string email)
    {
        if (string.IsNullOrWhiteSpace(name) || name.Length < 3)
            throw new InvalidOperationException("Nombre es obligatorio y debe tener al menos 3 caracteres.");

        if (string.IsNullOrWhiteSpace(email) || !email.Contains("@"))
            throw new InvalidOperationException("Email inválido.");
    }

    private static UserResponse MapToResponse(User user) =>
        new(user.Id, user.Name, user.Email, user.Status, user.CreatedAt, user.UpdatedAt);
}
