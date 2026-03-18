using Bootcamp.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace Bootcamp.Api.Infrastructure;

/// <summary>
/// DbContext para la aplicación. Gestiona la conexión y mapeo con PostgreSQL.
/// </summary>
public sealed class AppDb : DbContext
{
    public AppDb(DbContextOptions<AppDb> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configuración de la tabla Users
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            
            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(255);

            entity.Property(e => e.Email)
                .IsRequired()
                .HasMaxLength(255);

            entity.Property(e => e.Status)
                .IsRequired()
                .HasMaxLength(50)
                .HasDefaultValue("active");

            entity.Property(e => e.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("NOW()");

            entity.Property(e => e.UpdatedAt)
                .IsRequired()
                .HasDefaultValueSql("NOW()");

            entity.Property(e => e.LastLoginAt)
                .HasColumnType("timestamp with time zone")
                .IsRequired(false);

            // Índice único para email
            entity.HasIndex(e => e.Email).IsUnique();

            // Índice para búsquedas por status
            entity.HasIndex(e => e.Status);

            // Índice para ordenamiento/paginación por fecha de creación.
            entity.HasIndex(e => e.CreatedAt);

            // Índice compuesto para filtros por status + orden por fecha.
            entity.HasIndex(e => new { e.Status, e.CreatedAt });
        });
    }
}

