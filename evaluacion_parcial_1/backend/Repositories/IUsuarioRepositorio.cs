using Backend.Models;

namespace Backend.Repositories;

public interface IUsuarioRepositorio
{
    Task<Usuario?> ObtenerPorUsernameAsync(string username);
    Task<List<string>> ObtenerRolesPorUsuarioIdAsync(int usuarioId);
    Task GuardarCambiosAsync();
}
