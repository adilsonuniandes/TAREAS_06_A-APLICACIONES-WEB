using Backend.Models;

namespace Backend.Repositories;

public interface IAlquilerRepositorio
{
    Task<List<Alquiler>> ObtenerTodos();
    Task<Alquiler?> ObtenerPorId(int id);
    Task<Alquiler> Crear(Alquiler alquiler);
    Task Cerrar(Alquiler alquiler);
}