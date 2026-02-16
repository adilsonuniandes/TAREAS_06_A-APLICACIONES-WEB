using Backend.DTOs;
using Backend.Models;
using Backend.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/asignaciones")]
public class AsignacionesController : ControllerBase
{
    private readonly IAsignacionRepositorio _repositorio;

    public AsignacionesController(IAsignacionRepositorio repositorio)
    {
        _repositorio = repositorio;
    }

    [HttpGet]
    [Authorize(Roles = "empleado,supervisor,administrador")]
    public async Task<ActionResult<List<Asignacion>>> ObtenerTodos()
    {
        var lista = await _repositorio.ObtenerTodosAsync();
        return Ok(lista);
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = "empleado,supervisor,administrador")]
    public async Task<ActionResult<Asignacion>> ObtenerPorId(int id)
    {
        var item = await _repositorio.ObtenerPorIdAsync(id);
        if (item is null) return NotFound("Asignación no encontrada.");
        return Ok(item);
    }

    [HttpPost]
    [Authorize(Roles = "supervisor,administrador")]
    public async Task<ActionResult<Asignacion>> Crear([FromBody] AsignacionCrearDto dto)
    {
        if (!await _repositorio.ExisteEmpleadoAsync(dto.EmpleadoId))
            return BadRequest("El empleado no existe.");

        if (!await _repositorio.ExisteDepartamentoAsync(dto.DepartamentoId))
            return BadRequest("El departamento no existe.");

        if (await _repositorio.ExisteAsignacionAsync(dto.EmpleadoId, dto.DepartamentoId))
            return Conflict("La asignación ya existe para ese empleado y departamento.");

        var nueva = new Asignacion
        {
            EmpleadoId = dto.EmpleadoId,
            DepartamentoId = dto.DepartamentoId,
            FechaAsignacion = DateTime.UtcNow
        };

        var creada = await _repositorio.CrearAsync(nueva);
        return CreatedAtAction(nameof(ObtenerPorId), new { id = creada.AsignacionId }, creada);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "supervisor,administrador")]
    public async Task<IActionResult> Actualizar(int id, [FromBody] AsignacionActualizarDto dto)
    {
        var existente = await _repositorio.ObtenerPorIdAsync(id);
        if (existente is null) return NotFound("Asignación no encontrada.");

        if (!await _repositorio.ExisteEmpleadoAsync(dto.EmpleadoId))
            return BadRequest("El empleado no existe.");

        if (!await _repositorio.ExisteDepartamentoAsync(dto.DepartamentoId))
            return BadRequest("El departamento no existe.");

        if (await _repositorio.ExisteAsignacionAsync(dto.EmpleadoId, dto.DepartamentoId, id))
            return Conflict("La asignación ya existe para ese empleado y departamento.");

        var actualizada = new Asignacion
        {
            AsignacionId = id,
            EmpleadoId = dto.EmpleadoId,
            DepartamentoId = dto.DepartamentoId,
            FechaAsignacion = existente.FechaAsignacion
        };

        var ok = await _repositorio.ActualizarAsync(actualizada);
        if (!ok) return BadRequest("No se pudo actualizar la asignación.");

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "administrador")]
    public async Task<IActionResult> Eliminar(int id)
    {
        var ok = await _repositorio.EliminarAsync(id);
        if (!ok) return NotFound("Asignación no encontrada.");
        return NoContent();
    }
}
