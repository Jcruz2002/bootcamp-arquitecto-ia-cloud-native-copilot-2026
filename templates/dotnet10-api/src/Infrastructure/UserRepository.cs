using Bootcamp.Api.Application;
using Bootcamp.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace Bootcamp.Api.Infrastructure;

/// <summary>
/// Implementación de repositorio de usuarios con Entity Framework Core y PostgreSQL.
/// </summary>
public sealed class UserRepository : IUserRepository
{
    private readonly AppDb _db;

    public UserRepository(AppDb db)
    {
        _db = db;
    }

    public async Task<User?> GetByIdAsync(Guid id, CancellationToken ct)
    {
        return await _db.Users.FirstOrDefaultAsync(u => u.Id == id, ct);
    }

    public async Task<List<User>> GetAllAsync(int skip, int take, CancellationToken ct)
    {
        return await _db.Users
            .OrderByDescending(u => u.CreatedAt)
            .Skip(skip)
            .Take(take)
            .ToListAsync(ct);
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken ct)
    {
        return await _db.Users.FirstOrDefaultAsync(u => u.Email == email, ct);
    }

    public async Task<User> CreateAsync(User user, CancellationToken ct)
    {
        _db.Users.Add(user);
        await _db.SaveChangesAsync(ct);
        return user;
    }

    public async Task<User> UpdateAsync(User user, CancellationToken ct)
    {
        _db.Users.Update(user);
        await _db.SaveChangesAsync(ct);
        return user;
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var user = await GetByIdAsync(id, ct);
        if (user is not null)
        {
            _db.Users.Remove(user);
            await _db.SaveChangesAsync(ct);
        }
    }
}
