using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models;

[Table("departamentos")]
public class Departamento
{
    [Key]
    [Column("departamento_id")]
    public int DepartamentoId { get; set; }

    [Required]
    [Column("nombre")]
    [MaxLength(100)]
    public string Nombre { get; set; } = string.Empty;

    [Column("ubicacion")]
    [MaxLength(100)]
    public string? Ubicacion { get; set; }

    [Column("jefe_departamento")]
    [MaxLength(100)]
    public string? JefeDepartamento { get; set; }

    [Column("extension")]
    [MaxLength(10)]
    public string? Extension { get; set; }

    public ICollection<Asignacion> Asignaciones { get; set; } = new List<Asignacion>();
}
