using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories;

public class AsignacionRepositorio : IAsignacionRepositorio
{
    private readonly AppDbContext _contexto;

    public AsignacionRepositorio(AppDbContext contexto)
    {
        _contexto = contexto;
    }

    public async Task<List<Asignacion>> ObtenerTodosAsync()
    {
        return await _contexto.Asignaciones
            .AsNoTracking()
            .Include(a => a.Empleado)
            .Include(a => a.Departamento)
            .OrderBy(a => a.AsignacionId)
            .ToListAsync();
    }

    public async Task<Asignacion?> ObtenerPorIdAsync(int id)
    {
        return await _contexto.Asignaciones
            .AsNoTracking()
            .Include(a => a.Empleado)
            .Include(a => a.Departamento)
            .FirstOrDefaultAsync(a => a.AsignacionId == id);
    }

    public async Task<bool> ExisteEmpleadoAsync(int empleadoId)
    {
        return await _contexto.Empleados.AsNoTracking().AnyAsync(e => e.EmpleadoId == empleadoId);
    }

    public async Task<bool> ExisteDepartamentoAsync(int departamentoId)
    {
        return await _contexto.Departamentos.AsNoTracking().AnyAsync(d => d.DepartamentoId == departamentoId);
    }

    public async Task<bool> ExisteAsignacionAsync(int empleadoId, int departamentoId, int? asignacionIdIgnorar = null)
    {
        var q = _contexto.Asignaciones.AsNoTracking()
            .Where(a => a.EmpleadoId == empleadoId && a.DepartamentoId == departamentoId);

        if (asignacionIdIgnorar.HasValue)
            q = q.Where(a => a.AsignacionId != asignacionIdIgnorar.Value);

        return await q.AnyAsync();
    }

    public async Task<Asignacion> CrearAsync(Asignacion asignacion)
    {
        _contexto.Asignaciones.Add(asignacion);
        await _contexto.SaveChangesAsync();
        return asignacion;
    }

    public async Task<bool> ActualizarAsync(Asignacion asignacion)
    {
        _contexto.Asignaciones.Update(asignacion);
        return await _contexto.SaveChangesAsync() > 0;
    }

    public async Task<bool> EliminarAsync(int id)
    {
        var existente = await _contexto.Asignaciones.FirstOrDefaultAsync(a => a.AsignacionId == id);
        if (existente is null) return false;

        _contexto.Asignaciones.Remove(existente);
        return await _contexto.SaveChangesAsync() > 0;
    }
}
