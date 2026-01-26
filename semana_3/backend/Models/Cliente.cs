namespace Backend.Models;

public class Cliente
{
    public int ClienteId { get; set; }

    public string Empresa { get; set; } = "";
    public string Identificacion { get; set; } = "";
    public string Nombres { get; set; } = "";
    public string Apellidos { get; set; } = "";

    public string? Email { get; set; }
    public string? Telefono { get; set; }
    public string? Direccion { get; set; }

    public string? ReferidoPor { get; set; }
    public string? CanalReferencia { get; set; }

    public DateTime FechaRegistro { get; set; }
    public bool Activo { get; set; }
}
