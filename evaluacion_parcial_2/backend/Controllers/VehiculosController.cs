using Backend.DTOs;
using Backend.Models;
using Backend.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class VehiculosController : ControllerBase
{
    private readonly IVehiculoRepositorio _repo;

    public VehiculosController(IVehiculoRepositorio repo)
    {
        _repo = repo;
    }

    [HttpGet]
    public async Task<IActionResult> Obtener()
        => Ok(await _repo.ObtenerTodos());

    [HttpGet("{id}")]
    public async Task<IActionResult> ObtenerPorId(int id)
    {
        var v = await _repo.ObtenerPorId(id);
        if (v == null) return NotFound();
        return Ok(v);
    }

    [HttpPost]
    public async Task<IActionResult> Crear(VehiculoCrearDto dto)
    {
        var vehiculo = new Vehiculo
        {
            Marca = dto.Marca,
            Modelo = dto.Modelo,
            Anio = dto.Anio,
            Disponible = true
        };

        await _repo.Crear(vehiculo);
        return Ok(vehiculo);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Actualizar(int id, VehiculoActualizarDto dto)
    {
        var v = await _repo.ObtenerPorId(id);
        if (v == null) return NotFound();

        v.Marca = dto.Marca;
        v.Modelo = dto.Modelo;
        v.Anio = dto.Anio;
        v.Disponible = dto.Disponible;

        await _repo.Actualizar(v);
        return Ok(v);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Eliminar(int id)
    {
        await _repo.Eliminar(id);
        return NoContent();
    }
}