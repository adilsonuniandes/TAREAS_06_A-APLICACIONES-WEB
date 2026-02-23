using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs;

public class SolicitudInicioSesionDto
{
    [Required]
    public string Username { get; set; } = string.Empty;

    [Required]
    public string Contrasena { get; set; } = string.Empty;
}
