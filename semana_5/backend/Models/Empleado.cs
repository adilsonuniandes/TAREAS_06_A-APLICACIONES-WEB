using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models;

[Table("empleados")]
public class Empleado
{
    [Key]
    [Column("empleado_id")]
    public int EmpleadoId { get; set; }

    [Required]
    [Column("nombre")]
    [MaxLength(100)]
    public string Nombre { get; set; } = string.Empty;

    [Required]
    [Column("apellido")]
    [MaxLength(100)]
    public string Apellido { get; set; } = string.Empty;

    [Required]
    [Column("email")]
    [MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    [Column("telefono")]
    [MaxLength(20)]
    public string? Telefono { get; set; }

    public ICollection<Asignacion> Asignaciones { get; set; } = new List<Asignacion>();
}
