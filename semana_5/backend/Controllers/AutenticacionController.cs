using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Backend.DTOs;
using Backend.Repositories;
using BCrypt.Net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace Backend.Controllers;

[ApiController]
[Route("api/autenticacion")]
public class AutenticacionController : ControllerBase
{
    private readonly IUsuarioRepositorio _usuarioRepositorio;
    private readonly IConfiguration _configuracion;

    public AutenticacionController(IUsuarioRepositorio usuarioRepositorio, IConfiguration configuracion)
    {
        _usuarioRepositorio = usuarioRepositorio;
        _configuracion = configuracion;
    }

    [HttpPost("iniciar-sesion")]
    public async Task<ActionResult<RespuestaInicioSesionDto>> IniciarSesion([FromBody] SolicitudInicioSesionDto solicitud)
    {
        var usuario = await _usuarioRepositorio.ObtenerPorUsernameAsync(solicitud.Username);
        if (usuario is null) return Unauthorized("Credenciales inválidas.");

        var passwordGuardada = usuario.PasswordHash;


        bool valida;
        if (passwordGuardada.StartsWith("$2")) // bcrypt típico
        {
            valida = BCrypt.Net.BCrypt.Verify(solicitud.Contrasena, passwordGuardada);
        }
        else
        {
            valida = (solicitud.Contrasena == passwordGuardada);
            if (valida)
            {
                usuario.PasswordHash = BCrypt.Net.BCrypt.HashPassword(solicitud.Contrasena);
                await _usuarioRepositorio.GuardarCambiosAsync();
            }
        }

        if (!valida) return Unauthorized("Credenciales inválidas.");

        var roles = await _usuarioRepositorio.ObtenerRolesPorUsuarioIdAsync(usuario.UsuarioId);
        var token = GenerarToken(usuario.Username, roles);

        return Ok(new RespuestaInicioSesionDto
        {
            Token = token,
            Username = usuario.Username,
            Roles = roles
        });
    }

    private string GenerarToken(string username, List<string> roles)
    {
        var jwt = _configuracion.GetSection("Jwt");
        var clave = jwt["Clave"]!;
        var emisor = jwt["Emisor"]!;
        var audiencia = jwt["Audiencia"]!;
        var minutos = int.Parse(jwt["MinutosExpiracion"] ?? "120");

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.Name, username)
        };

        foreach (var rol in roles)
            claims.Add(new Claim(ClaimTypes.Role, rol));

        var llave = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(clave));
        var credenciales = new SigningCredentials(llave, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: emisor,
            audience: audiencia,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(minutos),
            signingCredentials: credenciales
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
