using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories;

public class DepartamentoRepositorio : IDepartamentoRepositorio
{
    private readonly AppDbContext _contexto;

    public DepartamentoRepositorio(AppDbContext contexto)
    {
        _contexto = contexto;
    }

    public async Task<List<Departamento>> ObtenerTodosAsync()
    {
        return await _contexto.Departamentos
            .AsNoTracking()
            .OrderBy(d => d.DepartamentoId)
            .ToListAsync();
    }

    public async Task<Departamento?> ObtenerPorIdAsync(int id)
    {
        return await _contexto.Departamentos
            .AsNoTracking()
            .FirstOrDefaultAsync(d => d.DepartamentoId == id);
    }

    public async Task<Departamento> CrearAsync(Departamento departamento)
    {
        _contexto.Departamentos.Add(departamento);
        await _contexto.SaveChangesAsync();
        return departamento;
    }

    public async Task<bool> ActualizarAsync(Departamento departamento)
    {
        _contexto.Departamentos.Update(departamento);
        return await _contexto.SaveChangesAsync() > 0;
    }

    public async Task<bool> EliminarAsync(int id)
    {
        var existente = await _contexto.Departamentos.FirstOrDefaultAsync(d => d.DepartamentoId == id);
        if (existente is null) return false;

        _contexto.Departamentos.Remove(existente);
        return await _contexto.SaveChangesAsync() > 0;
    }
}
