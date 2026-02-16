using Backend.Models;

namespace Backend.Repositories;

public interface IEmpleadoRepositorio
{
    Task<List<Empleado>> ObtenerTodosAsync();
    Task<Empleado?> ObtenerPorIdAsync(int id);
    Task<bool> ExisteEmailAsync(string email, int? empleadoIdIgnorar = null);
    Task<Empleado> CrearAsync(Empleado empleado);
    Task<bool> ActualizarAsync(Empleado empleado);
    Task<bool> EliminarAsync(int id);
}
