using Bootcamp.Api.Domain;
using Bootcamp.Api.Infrastructure;

namespace Bootcamp.Api.Application;

public static class Seed
{
  public static async Task InitAsync(AppDb db)
  {
    if (!db.Users.Any())
    {
      db.Users.AddRange(Enumerable.Range(1, 100)
        .Select(i => new User($"User {i}", $"user{i}@demo.com")));
      await db.SaveChangesAsync();
    }
  }
}
