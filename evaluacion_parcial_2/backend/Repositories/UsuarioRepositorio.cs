using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories;

public class UsuarioRepositorio : IUsuarioRepositorio
{
    private readonly AppDbContext _contexto;

    public UsuarioRepositorio(AppDbContext contexto)
    {
        _contexto = contexto;
    }

    // ============================
    // MÉTODOS EXISTENTES (LOGIN)
    // ============================

    public async Task<Usuario?> ObtenerPorUsernameAsync(string username)
    {
        return await _contexto.Usuarios
            .FirstOrDefaultAsync(u => u.Username == username && u.Activo);
    }

    public async Task<List<string>> ObtenerRolesPorUsuarioIdAsync(int usuarioId)
    {
        return await _contexto.UsuarioRoles
            .Where(ur => ur.UsuarioId == usuarioId)
            .Select(ur => ur.Rol.Nombre)
            .ToListAsync();
    }

    public async Task GuardarCambiosAsync()
    {
        await _contexto.SaveChangesAsync();
    }

    // ============================
    // CRUD USUARIOS (ADMIN)
    // ============================

    public async Task<List<Usuario>> ObtenerTodosAsync()
    {
        return await _contexto.Usuarios
            .Include(u => u.UsuarioRoles)
                .ThenInclude(ur => ur.Rol)
            .OrderBy(u => u.UsuarioId)
            .ToListAsync();
    }

    public async Task<Usuario?> ObtenerPorIdAsync(int usuarioId)
    {
        return await _contexto.Usuarios
            .Include(u => u.UsuarioRoles)
                .ThenInclude(ur => ur.Rol)
            .FirstOrDefaultAsync(u => u.UsuarioId == usuarioId);
    }

    public async Task CrearAsync(Usuario usuario, List<int> rolIds)
    {
        var existe = await _contexto.Usuarios
            .AnyAsync(u => u.Username == usuario.Username);

        if (existe)
            throw new Exception("El username ya existe.");

        _contexto.Usuarios.Add(usuario);
        await _contexto.SaveChangesAsync();

        foreach (var rolId in rolIds)
        {
            _contexto.UsuarioRoles.Add(new UsuarioRol
            {
                UsuarioId = usuario.UsuarioId,
                RolId = rolId
            });
        }

        await _contexto.SaveChangesAsync();
    }

    public async Task ActualizarAsync(Usuario usuario, List<int> rolIds)
    {
        var usuarioDb = await _contexto.Usuarios
            .Include(u => u.UsuarioRoles)
            .FirstOrDefaultAsync(u => u.UsuarioId == usuario.UsuarioId);

        if (usuarioDb == null)
            throw new Exception("Usuario no encontrado.");

        usuarioDb.Username = usuario.Username;
        usuarioDb.Activo = usuario.Activo;

        // actualizar contraseña SOLO si viene
        if (!string.IsNullOrWhiteSpace(usuario.PasswordHash))
        {
            usuarioDb.PasswordHash = usuario.PasswordHash;
        }

        // reemplazar roles
        _contexto.UsuarioRoles.RemoveRange(usuarioDb.UsuarioRoles);

        foreach (var rolId in rolIds)
        {
            _contexto.UsuarioRoles.Add(new UsuarioRol
            {
                UsuarioId = usuarioDb.UsuarioId,
                RolId = rolId
            });
        }

        await _contexto.SaveChangesAsync();
    }

    public async Task EliminarAsync(int usuarioId)
    {
        var usuario = await _contexto.Usuarios
            .Include(u => u.UsuarioRoles)
            .FirstOrDefaultAsync(u => u.UsuarioId == usuarioId);

        if (usuario == null)
            throw new Exception("Usuario no encontrado.");

        _contexto.UsuarioRoles.RemoveRange(usuario.UsuarioRoles);
        _contexto.Usuarios.Remove(usuario);

        await _contexto.SaveChangesAsync();
    }
}
