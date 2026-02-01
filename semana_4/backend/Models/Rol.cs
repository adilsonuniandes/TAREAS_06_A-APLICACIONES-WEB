using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models;

[Table("roles")]
public class Rol
{
    [Key]
    [Column("rol_id")]
    public int RolId { get; set; }

    [Required]
    [Column("nombre")]
    [MaxLength(50)]
    public string Nombre { get; set; } = string.Empty;

    [Column("descripcion")]
    [MaxLength(150)]
    public string? Descripcion { get; set; }

    public ICollection<UsuarioRol> UsuarioRoles { get; set; } = new List<UsuarioRol>();
}
