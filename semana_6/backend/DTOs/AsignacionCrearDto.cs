using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs;

public class AsignacionCrearDto
{
    [Required]
    public int EmpleadoId { get; set; }

    [Required]
    public int DepartamentoId { get; set; }
}
