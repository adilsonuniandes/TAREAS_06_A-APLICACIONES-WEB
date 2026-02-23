using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Rol> Roles => Set<Rol>();
    public DbSet<UsuarioRol> UsuarioRoles => Set<UsuarioRol>();
    public DbSet<Empleado> Empleados => Set<Empleado>();
    public DbSet<Departamento> Departamentos => Set<Departamento>();
    public DbSet<Asignacion> Asignaciones => Set<Asignacion>();

    public DbSet<Cliente> Clientes => Set<Cliente>();
    public DbSet<Factura> Facturas => Set<Factura>();
    public DbSet<FacturaDetalle> FacturaDetalles => Set<FacturaDetalle>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<UsuarioRol>()
            .HasKey(x => new { x.UsuarioId, x.RolId });

        modelBuilder.Entity<Cliente>()
            .HasIndex(c => c.Identificacion)
            .IsUnique();

        modelBuilder.Entity<Factura>()
            .HasIndex(f => f.NumeroFactura)
            .IsUnique();

        modelBuilder.Entity<Factura>()
            .HasOne(f => f.Cliente)
            .WithMany(c => c.Facturas)
            .HasForeignKey(f => f.ClienteId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<FacturaDetalle>()
            .HasOne(d => d.Factura)
            .WithMany(f => f.Detalles)
            .HasForeignKey(d => d.FacturaId);

        base.OnModelCreating(modelBuilder);
    }
}