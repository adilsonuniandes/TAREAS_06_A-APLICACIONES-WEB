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
}
