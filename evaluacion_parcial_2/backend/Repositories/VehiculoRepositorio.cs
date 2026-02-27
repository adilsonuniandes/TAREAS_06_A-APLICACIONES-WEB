using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories;

public class VehiculoRepositorio : IVehiculoRepositorio
{
    private readonly AppDbContext _context;

    public VehiculoRepositorio(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Vehiculo>> ObtenerTodos()
        => await _context.Vehiculos.ToListAsync();

    public async Task<Vehiculo?> ObtenerPorId(int id)
        => await _context.Vehiculos.FirstOrDefaultAsync(x => x.VehiculoId == id);

    public async Task<Vehiculo> Crear(Vehiculo vehiculo)
    {
        _context.Vehiculos.Add(vehiculo);
        await _context.SaveChangesAsync();
        return vehiculo;
    }

    public async Task Actualizar(Vehiculo vehiculo)
    {
        _context.Vehiculos.Update(vehiculo);
        await _context.SaveChangesAsync();
    }

    public async Task Eliminar(int id)
    {
        var v = await _context.Vehiculos.FirstOrDefaultAsync(x => x.VehiculoId == id);
        if (v == null) return;
        _context.Vehiculos.Remove(v);
        await _context.SaveChangesAsync();
    }
}