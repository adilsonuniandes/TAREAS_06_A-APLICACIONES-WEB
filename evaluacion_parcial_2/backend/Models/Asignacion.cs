using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models;

[Table("asignaciones")]
public class Asignacion
{
    [Key]
    [Column("asignacion_id")]
    public int AsignacionId { get; set; }

    [Column("empleado_id")]
    public int EmpleadoId { get; set; }
    public Empleado Empleado { get; set; } = null!;

    [Column("departamento_id")]
    public int DepartamentoId { get; set; }
    public Departamento Departamento { get; set; } = null!;

    [Column("fecha_asignacion")]
    public DateTime FechaAsignacion { get; set; }
}
