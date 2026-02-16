using Backend.Models;

namespace Backend.Repositories;

public interface IUsuarioRepositorio
{
    // EXISTENTES (login)
    Task<Usuario?> ObtenerPorUsernameAsync(string username);
    Task<List<string>> ObtenerRolesPorUsuarioIdAsync(int usuarioId);
    Task GuardarCambiosAsync();

    // NUEVOS (CRUD ADMIN)
    Task<List<Usuario>> ObtenerTodosAsync();
    Task<Usuario?> ObtenerPorIdAsync(int usuarioId);
    Task CrearAsync(Usuario usuario, List<int> rolIds);
    Task ActualizarAsync(Usuario usuario, List<int> rolIds);
    Task EliminarAsync(int usuarioId);
}
