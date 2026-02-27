namespace Backend.DTOs;

public class VehiculoCrearDto
{
    public string Marca { get; set; } = null!;
    public string Modelo { get; set; } = null!;
    public int Anio { get; set; }
}