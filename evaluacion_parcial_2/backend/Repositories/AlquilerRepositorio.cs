using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories;

public class AlquilerRepositorio : IAlquilerRepositorio
{
    private readonly AppDbContext _context;

    public AlquilerRepositorio(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Alquiler>> ObtenerTodos()
        => await _context.Alquileres
            .Include(a => a.Vehiculo)
            .Include(a => a.Cliente)
            .ToListAsync();

    public async Task<Alquiler?> ObtenerPorId(int id)
        => await _context.Alquileres
            .Include(a => a.Vehiculo)
            .Include(a => a.Cliente)
            .FirstOrDefaultAsync(a => a.AlquilerId == id);

    public async Task<Alquiler> Crear(Alquiler alquiler)
    {
        _context.Alquileres.Add(alquiler);
        await _context.SaveChangesAsync();
        return alquiler;
    }

    public async Task Cerrar(Alquiler alquiler)
    {
        _context.Alquileres.Update(alquiler);
        await _context.SaveChangesAsync();
    }
}