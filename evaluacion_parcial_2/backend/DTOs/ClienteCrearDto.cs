namespace Backend.DTOs;

public class ClienteCrearDto
{
    public string Nombre { get; set; } = null!;
    public string Apellido { get; set; } = null!;
    public string Licencia { get; set; } = null!;
    public string? Telefono { get; set; }
}