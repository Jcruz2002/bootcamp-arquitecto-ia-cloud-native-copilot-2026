namespace Bootcamp.Api.Domain;

/// <summary>
/// Entidad de dominio para representar un usuario del sistema.
/// </summary>
public sealed class User
{
    // Constructor sin parámetros para EF Core
    public User()
    {
    }

    // Constructor para crear nuevos usuarios
    public User(string name, string email, string status = "active")
    {
        Id = Guid.NewGuid();
        Name = name;
        Email = email;
        Status = status;
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public Guid Id { get; init; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Status { get; set; } = "active";
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; set; }
}
