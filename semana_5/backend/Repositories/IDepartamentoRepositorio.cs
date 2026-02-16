using Backend.Models;

namespace Backend.Repositories;

public interface IDepartamentoRepositorio
{
    Task<List<Departamento>> ObtenerTodosAsync();
    Task<Departamento?> ObtenerPorIdAsync(int id);
    Task<Departamento> CrearAsync(Departamento departamento);
    Task<bool> ActualizarAsync(Departamento departamento);
    Task<bool> EliminarAsync(int id);
}
