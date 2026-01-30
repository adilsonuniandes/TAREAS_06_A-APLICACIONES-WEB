using Backend.Models;

namespace Backend.Repositories;

public interface IAsignacionRepositorio
{
    Task<List<Asignacion>> ObtenerTodosAsync();
    Task<Asignacion?> ObtenerPorIdAsync(int id);

    Task<bool> ExisteEmpleadoAsync(int empleadoId);
    Task<bool> ExisteDepartamentoAsync(int departamentoId);
    Task<bool> ExisteAsignacionAsync(int empleadoId, int departamentoId, int? asignacionIdIgnorar = null);

    Task<Asignacion> CrearAsync(Asignacion asignacion);
    Task<bool> ActualizarAsync(Asignacion asignacion);
    Task<bool> EliminarAsync(int id);
}
