using Bootcamp.Api.Domain;
using Bootcamp.Api.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace Bootcamp.Api.Application;

public static class Seed
{
  public static async Task InitAsync(AppDb db)
  {
    var defaults = new[]
    {
      new { Name = "Admin Seed", Email = "admin.seed@demo.com", Status = "active" },
      new { Name = "User Seed", Email = "user.seed@demo.com", Status = "active" }
    };

    var existingEmails = await db.Users
      .Where(u => defaults.Select(d => d.Email).Contains(u.Email))
      .Select(u => u.Email)
      .ToListAsync();

    var toInsert = defaults
      .Where(d => !existingEmails.Contains(d.Email))
      .Select(d => new User(d.Name, d.Email, d.Status))
      .ToList();

    if (toInsert.Count > 0)
    {
      db.Users.AddRange(toInsert);
      await db.SaveChangesAsync();
    }
  }
}
