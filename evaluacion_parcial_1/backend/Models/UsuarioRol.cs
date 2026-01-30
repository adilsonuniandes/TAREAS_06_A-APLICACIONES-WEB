using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models;

[Table("usuario_roles")]
public class UsuarioRol
{
    [Column("usuario_id")]
    public int UsuarioId { get; set; }
    public Usuario Usuario { get; set; } = null!;

    [Column("rol_id")]
    public int RolId { get; set; }
    public Rol Rol { get; set; } = null!;
}
