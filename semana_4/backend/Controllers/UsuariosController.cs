using System.Security.Cryptography;
using System.Text;
using Backend.Data;
using Backend.Models;
using Backend.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "administrador")]
public class UsuariosController : ControllerBase
{
    private readonly IUsuarioRepositorio _repo;
    private readonly AppDbContext _contexto;

    public UsuariosController(IUsuarioRepositorio repo, AppDbContext contexto)
    {
        _repo = repo;
        _contexto = contexto;
    }

    // ----------------------------
    // ROLES (para combos en front)
    // ----------------------------
    [HttpGet("roles")]
    public async Task<IActionResult> ObtenerRoles()
    {
        var roles = await _contexto.Roles
            .AsNoTracking()
            .OrderBy(r => r.RolId)
            .Select(r => new RolRespuesta
            {
                RolId = r.RolId,
                Nombre = r.Nombre
            })
            .ToListAsync();

        return Ok(roles);
    }

    // ----------------------------
    // CRUD USUARIOS
    // ----------------------------

    [HttpGet]
    public async Task<IActionResult> ObtenerTodos()
    {
        var usuarios = await _repo.ObtenerTodosAsync();
        var salida = usuarios.Select(MapearUsuarioRespuesta).ToList();
        return Ok(salida);
    }

    [HttpGet("{usuarioId:int}")]
    public async Task<IActionResult> ObtenerPorId(int usuarioId)
    {
        var usuario = await _repo.ObtenerPorIdAsync(usuarioId);
        if (usuario == null) return NotFound("Usuario no encontrado.");

        return Ok(MapearUsuarioRespuesta(usuario));
    }

    [HttpPost]
    public async Task<IActionResult> Crear([FromBody] UsuarioCrearSolicitud dto)
    {
        if (dto == null) return BadRequest("Solicitud inválida.");
        if (string.IsNullOrWhiteSpace(dto.Username)) return BadRequest("El username es obligatorio.");
        if (string.IsNullOrWhiteSpace(dto.Contrasena)) return BadRequest("La contraseña es obligatoria.");
        if (dto.RolIds == null || dto.RolIds.Count == 0) return BadRequest("Debe asignar al menos un rol.");

        // validar roles existentes
        var rolesValidos = await _contexto.Roles
            .Where(r => dto.RolIds.Contains(r.RolId))
            .Select(r => r.RolId)
            .ToListAsync();

        if (rolesValidos.Count != dto.RolIds.Count)
            return BadRequest("Uno o más roles no existen.");

        var usuario = new Usuario
        {
            Username = dto.Username.Trim(),
            Activo = dto.Activo,
            PasswordHash = HashContrasena(dto.Contrasena)
        };

        try
        {
            await _repo.CrearAsync(usuario, dto.RolIds);

            var creado = await _repo.ObtenerPorIdAsync(usuario.UsuarioId);
            if (creado == null) return StatusCode(500, "No se pudo recuperar el usuario creado.");

            return CreatedAtAction(nameof(ObtenerPorId), new { usuarioId = usuario.UsuarioId }, MapearUsuarioRespuesta(creado));
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{usuarioId:int}")]
    public async Task<IActionResult> Actualizar(int usuarioId, [FromBody] UsuarioActualizarSolicitud dto)
    {
        if (dto == null) return BadRequest("Solicitud inválida.");
        if (string.IsNullOrWhiteSpace(dto.Username)) return BadRequest("El username es obligatorio.");
        if (dto.RolIds == null || dto.RolIds.Count == 0) return BadRequest("Debe asignar al menos un rol.");

        // validar roles existentes
        var rolesValidos = await _contexto.Roles
            .Where(r => dto.RolIds.Contains(r.RolId))
            .Select(r => r.RolId)
            .ToListAsync();

        if (rolesValidos.Count != dto.RolIds.Count)
            return BadRequest("Uno o más roles no existen.");

        var usuario = new Usuario
        {
            UsuarioId = usuarioId,
            Username = dto.Username.Trim(),
            Activo = dto.Activo,
            // IMPORTANTE: si no viene contraseña, no se debe tocar
            PasswordHash = string.IsNullOrWhiteSpace(dto.Contrasena) ? "" : HashContrasena(dto.Contrasena)
        };

        try
        {
            await _repo.ActualizarAsync(usuario, dto.RolIds);
            return NoContent();
        }
        catch (Exception ex)
        {
            // si el repo lanza "Usuario no encontrado." lo convertimos en 404
            if (ex.Message.Contains("no encontrado", StringComparison.OrdinalIgnoreCase))
                return NotFound(ex.Message);

            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("{usuarioId:int}")]
    public async Task<IActionResult> Eliminar(int usuarioId)
    {
        try
        {
            await _repo.EliminarAsync(usuarioId);
            return NoContent();
        }
        catch (Exception ex)
        {
            if (ex.Message.Contains("no encontrado", StringComparison.OrdinalIgnoreCase))
                return NotFound(ex.Message);

            return BadRequest(ex.Message);
        }
    }

    // ----------------------------
    // MAPEOS (no exponer password)
    // ----------------------------

    private static UsuarioRespuesta MapearUsuarioRespuesta(Usuario u)
    {
        return new UsuarioRespuesta
        {
            UsuarioId = u.UsuarioId,
            Username = u.Username,
            Activo = u.Activo,
            Roles = u.UsuarioRoles?
                .Select(ur => ur.Rol?.Nombre ?? "")
                .Where(x => !string.IsNullOrWhiteSpace(x))
                .Distinct()
                .OrderBy(x => x)
                .ToList() ?? new List<string>()
        };
    }

    // ----------------------------
    // HASH (debe coincidir con login)
    // ----------------------------
    private static string HashContrasena(string contrasena)
    {
        using var sha = SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(contrasena);
        var hash = sha.ComputeHash(bytes);
        return Convert.ToBase64String(hash);
    }

    // ----------------------------
    // DTOs (en español, simples)
    // ----------------------------
    public class UsuarioCrearSolicitud
    {
        public string Username { get; set; } = string.Empty;
        public string Contrasena { get; set; } = string.Empty;
        public bool Activo { get; set; } = true;
        public List<int> RolIds { get; set; } = new();
    }

    public class UsuarioActualizarSolicitud
    {
        public string Username { get; set; } = string.Empty;
        public string? Contrasena { get; set; } // opcional
        public bool Activo { get; set; } = true;
        public List<int> RolIds { get; set; } = new();
    }

    public class UsuarioRespuesta
    {
        public int UsuarioId { get; set; }
        public string Username { get; set; } = string.Empty;
        public bool Activo { get; set; }
        public List<string> Roles { get; set; } = new();
    }

    public class RolRespuesta
    {
        public int RolId { get; set; }
        public string Nombre { get; set; } = string.Empty;
    }
}
