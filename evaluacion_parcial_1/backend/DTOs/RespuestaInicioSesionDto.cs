namespace Backend.DTOs;

public class RespuestaInicioSesionDto
{
    public string Token { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public List<string> Roles { get; set; } = new();
}
