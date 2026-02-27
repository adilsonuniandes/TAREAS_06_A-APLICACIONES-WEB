namespace Backend.DTOs;

public class VehiculoActualizarDto
{
    public string Marca { get; set; } = null!;
    public string Modelo { get; set; } = null!;
    public int Anio { get; set; }
    public bool Disponible { get; set; }
}