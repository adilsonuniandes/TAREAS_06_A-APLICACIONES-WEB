using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs;

public class DepartamentoActualizarDto
{
    [Required]
    [MaxLength(100)]
    public string Nombre { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? Ubicacion { get; set; }

    [MaxLength(100)]
    public string? JefeDepartamento { get; set; }

    [MaxLength(10)]
    public string? Extension { get; set; }
}
