using Backend.DTOs;
using Backend.Models;
using Backend.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AlquileresController : ControllerBase
{
    private readonly IAlquilerRepositorio _repo;
    private readonly IVehiculoRepositorio _vehiculoRepo;

    public AlquileresController(IAlquilerRepositorio repo, IVehiculoRepositorio vehiculoRepo)
    {
        _repo = repo;
        _vehiculoRepo = vehiculoRepo;
    }

    [HttpGet]
    public async Task<IActionResult> Obtener()
        => Ok(await _repo.ObtenerTodos());

    [HttpPost]
    public async Task<IActionResult> Crear(AlquilerCrearDto dto)
    {
        var vehiculo = await _vehiculoRepo.ObtenerPorId(dto.VehiculoId);
        if (vehiculo == null || !vehiculo.Disponible)
            return BadRequest("Vehículo no disponible");

        vehiculo.Disponible = false;
        await _vehiculoRepo.Actualizar(vehiculo);

        var alquiler = new Alquiler
        {
            VehiculoId = dto.VehiculoId,
            ClienteId = dto.ClienteId,
            FechaInicio = DateTime.Now,
            Activo = true
        };

        await _repo.Crear(alquiler);
        return Ok(alquiler);
    }

    [HttpPut("{id}/cerrar")]
    public async Task<IActionResult> Cerrar(int id, AlquilerCerrarDto dto)
    {
        var alquiler = await _repo.ObtenerPorId(id);
        if (alquiler == null)
            return NotFound();

        alquiler.FechaFin = dto.FechaFin;
        alquiler.Activo = false;

        var vehiculo = alquiler.Vehiculo;
        vehiculo.Disponible = true;

        await _repo.Cerrar(alquiler);
        await _vehiculoRepo.Actualizar(vehiculo);

        return Ok(alquiler);
    }
}