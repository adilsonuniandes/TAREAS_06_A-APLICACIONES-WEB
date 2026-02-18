using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories;

public class EmpleadoRepositorio : IEmpleadoRepositorio
{
    private readonly AppDbContext _contexto;

    public EmpleadoRepositorio(AppDbContext contexto)
    {
        _contexto = contexto;
    }

    public async Task<List<Empleado>> ObtenerTodosAsync()
    {
        return await _contexto.Empleados
            .AsNoTracking()
            .OrderBy(e => e.EmpleadoId)
            .ToListAsync();
    }

    public async Task<Empleado?> ObtenerPorIdAsync(int id)
    {
        return await _contexto.Empleados
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.EmpleadoId == id);
    }

    public async Task<bool> ExisteEmailAsync(string email, int? empleadoIdIgnorar = null)
    {
        var q = _contexto.Empleados.AsNoTracking().Where(e => e.Email == email);

        if (empleadoIdIgnorar.HasValue)
            q = q.Where(e => e.EmpleadoId != empleadoIdIgnorar.Value);

        return await q.AnyAsync();
    }

    public async Task<Empleado> CrearAsync(Empleado empleado)
    {
        _contexto.Empleados.Add(empleado);
        await _contexto.SaveChangesAsync();
        return empleado;
    }

    public async Task<bool> ActualizarAsync(Empleado empleado)
    {
        _contexto.Empleados.Update(empleado);
        return await _contexto.SaveChangesAsync() > 0;
    }

    public async Task<bool> EliminarAsync(int id)
    {
        var existente = await _contexto.Empleados.FirstOrDefaultAsync(e => e.EmpleadoId == id);
        if (existente is null) return false;

        _contexto.Empleados.Remove(existente);
        return await _contexto.SaveChangesAsync() > 0;
    }
}
