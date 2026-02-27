using Backend.Models;

namespace Backend.Repositories;

public interface IVehiculoRepositorio
{
    Task<List<Vehiculo>> ObtenerTodos();
    Task<Vehiculo?> ObtenerPorId(int id);
    Task<Vehiculo> Crear(Vehiculo vehiculo);
    Task Actualizar(Vehiculo vehiculo);
    Task Eliminar(int id);
}