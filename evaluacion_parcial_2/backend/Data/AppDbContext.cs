using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Rol> Roles => Set<Rol>();
    public DbSet<UsuarioRol> UsuarioRoles => Set<UsuarioRol>();

    public DbSet<Vehiculo> Vehiculos => Set<Vehiculo>();
    public DbSet<Cliente> Clientes => Set<Cliente>();
    public DbSet<Alquiler> Alquileres => Set<Alquiler>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<UsuarioRol>()
            .HasKey(x => new { x.UsuarioId, x.RolId });

        modelBuilder.Entity<Alquiler>()
            .HasOne(a => a.Cliente)
            .WithMany(c => c.Alquileres)
            .HasForeignKey(a => a.ClienteId);

        modelBuilder.Entity<Alquiler>()
            .HasOne(a => a.Vehiculo)
            .WithMany(v => v.Alquileres)
            .HasForeignKey(a => a.VehiculoId);

        base.OnModelCreating(modelBuilder);
    }
}