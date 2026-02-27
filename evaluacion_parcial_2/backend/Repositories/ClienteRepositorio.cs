using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories;

public class ClienteRepositorio : IClienteRepositorio
{
    private readonly AppDbContext _context;

    public ClienteRepositorio(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Cliente>> ObtenerTodos()
        => await _context.Clientes.ToListAsync();

    public async Task<Cliente?> ObtenerPorId(int id)
        => await _context.Clientes.FirstOrDefaultAsync(x => x.ClienteId == id);

    public async Task<Cliente> Crear(Cliente cliente)
    {
        _context.Clientes.Add(cliente);
        await _context.SaveChangesAsync();
        return cliente;
    }

    public async Task Actualizar(Cliente cliente)
    {
        _context.Clientes.Update(cliente);
        await _context.SaveChangesAsync();
    }

    public async Task Eliminar(int id)
    {
        var c = await _context.Clientes.FirstOrDefaultAsync(x => x.ClienteId == id);
        if (c == null) return;
        _context.Clientes.Remove(c);
        await _context.SaveChangesAsync();
    }
}