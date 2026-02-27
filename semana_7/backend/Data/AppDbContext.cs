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
        // =========================
        // TABLAS BASE (snake_case)
        // =========================

        modelBuilder.Entity<Rol>(e =>
        {
            e.ToTable("roles");
            e.HasKey(x => x.RolId);
            e.Property(x => x.RolId).HasColumnName("rol_id");
            e.Property(x => x.Nombre).HasColumnName("nombre");
            e.Property(x => x.Descripcion).HasColumnName("descripcion");
        });

        modelBuilder.Entity<Usuario>(e =>
        {
            e.ToTable("usuarios");
            e.HasKey(x => x.UsuarioId);
            e.Property(x => x.UsuarioId).HasColumnName("usuario_id");
            e.Property(x => x.Username).HasColumnName("username");
            e.Property(x => x.PasswordHash).HasColumnName("password_hash");
            e.Property(x => x.Activo).HasColumnName("activo");
            e.Property(x => x.FechaCreacion).HasColumnName("fecha_creacion");
        });

        modelBuilder.Entity<UsuarioRol>(e =>
        {
            e.ToTable("usuario_roles");
            e.HasKey(x => new { x.UsuarioId, x.RolId });
            e.Property(x => x.UsuarioId).HasColumnName("usuario_id");
            e.Property(x => x.RolId).HasColumnName("rol_id");
        });

        modelBuilder.Entity<Departamento>(e =>
        {
            e.ToTable("departamentos");
            e.HasKey(x => x.DepartamentoId);
            e.Property(x => x.DepartamentoId).HasColumnName("departamento_id");
            e.Property(x => x.Nombre).HasColumnName("nombre");
            e.Property(x => x.Ubicacion).HasColumnName("ubicacion");
            e.Property(x => x.JefeDepartamento).HasColumnName("jefe_departamento");
            e.Property(x => x.Extension).HasColumnName("extension");
        });

        modelBuilder.Entity<Empleado>(e =>
        {
            e.ToTable("empleados");
            e.HasKey(x => x.EmpleadoId);
            e.Property(x => x.EmpleadoId).HasColumnName("empleado_id");
            e.Property(x => x.Nombre).HasColumnName("nombre");
            e.Property(x => x.Apellido).HasColumnName("apellido");
            e.Property(x => x.Email).HasColumnName("email");
            e.Property(x => x.Telefono).HasColumnName("telefono");
        });

        modelBuilder.Entity<Asignacion>(e =>
        {
            e.ToTable("asignaciones");
            e.HasKey(x => x.AsignacionId);
            e.Property(x => x.AsignacionId).HasColumnName("asignacion_id");
            e.Property(x => x.EmpleadoId).HasColumnName("empleado_id");
            e.Property(x => x.DepartamentoId).HasColumnName("departamento_id");
            e.Property(x => x.FechaAsignacion).HasColumnName("fecha_asignacion");
        });

        // =========================
        // FACTURACIÓN (snake_case)
        // =========================

        modelBuilder.Entity<Cliente>(e =>
        {
            e.ToTable("clientes");
            e.HasKey(x => x.ClienteId);

            e.Property(x => x.ClienteId).HasColumnName("cliente_id");
            e.Property(x => x.Identificacion).HasColumnName("identificacion");
            e.Property(x => x.Nombres).HasColumnName("nombres");
            e.Property(x => x.Direccion).HasColumnName("direccion");
            e.Property(x => x.Telefono).HasColumnName("telefono");
            e.Property(x => x.Email).HasColumnName("email");

            e.HasIndex(x => x.Identificacion).IsUnique();
        });

        modelBuilder.Entity<Factura>(e =>
        {
            e.ToTable("facturas");
            e.HasKey(x => x.FacturaId);

            e.Property(x => x.FacturaId).HasColumnName("factura_id");
            e.Property(x => x.NumeroFactura).HasColumnName("numero_factura");
            e.Property(x => x.FechaEmision).HasColumnName("fecha_emision");

            e.Property(x => x.ClienteId).HasColumnName("cliente_id");
            e.Property(x => x.EmpleadoId).HasColumnName("empleado_id");
            e.Property(x => x.UsuarioId).HasColumnName("usuario_id");

            e.Property(x => x.Subtotal).HasColumnName("subtotal");
            e.Property(x => x.Iva).HasColumnName("iva");
            e.Property(x => x.Descuento).HasColumnName("descuento");
            e.Property(x => x.Total).HasColumnName("total");

            e.Property(x => x.Estado).HasColumnName("estado");
            e.Property(x => x.Observacion).HasColumnName("observacion");

            e.HasIndex(x => x.NumeroFactura).IsUnique();

            // Relaciones (lo que ya tenías)
            e.HasOne(x => x.Cliente)
                .WithMany(c => c.Facturas)
                .HasForeignKey(x => x.ClienteId)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasMany(x => x.Detalles)
                .WithOne(d => d.Factura!)
                .HasForeignKey(d => d.FacturaId);
        });

        modelBuilder.Entity<FacturaDetalle>(e =>
        {
            e.ToTable("factura_detalle");

            e.HasKey(x => x.DetalleId);

            e.Property(x => x.DetalleId).HasColumnName("detalle_id");
            e.Property(x => x.FacturaId).HasColumnName("factura_id");

            e.Property(x => x.Descripcion).HasColumnName("descripcion");
            e.Property(x => x.Cantidad).HasColumnName("cantidad");
            e.Property(x => x.PrecioUnitario).HasColumnName("precio_unitario");
            e.Property(x => x.DescuentoLinea).HasColumnName("descuento_linea");
            e.Property(x => x.IvaLinea).HasColumnName("iva_linea");

            // Si tu modelo tiene TotalLinea y en SQL es calculada:
            e.Property(x => x.TotalLinea)
                .HasColumnName("total_linea")
                .ValueGeneratedOnAddOrUpdate();
        });

        base.OnModelCreating(modelBuilder);
    }
}