using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs;

public class AsignacionActualizarDto
{
    [Required]
    public int EmpleadoId { get; set; }

    [Required]
    public int DepartamentoId { get; set; }
}
