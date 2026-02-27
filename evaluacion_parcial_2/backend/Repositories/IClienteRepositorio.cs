using Backend.Models;

namespace Backend.Repositories;

public interface IClienteRepositorio
{
    Task<List<Cliente>> ObtenerTodos();
    Task<Cliente?> ObtenerPorId(int id);
    Task<Cliente> Crear(Cliente cliente);
    Task Actualizar(Cliente cliente);
    Task Eliminar(int id);
}