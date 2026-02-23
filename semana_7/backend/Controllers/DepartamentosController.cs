using Backend.DTOs;
using Backend.Models;
using Backend.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/departamentos")]
public class DepartamentosController : ControllerBase
{
    private readonly IDepartamentoRepositorio _repositorio;

    public DepartamentosController(IDepartamentoRepositorio repositorio)
    {
        _repositorio = repositorio;
    }

    [HttpGet]
    [Authorize(Roles = "empleado,supervisor,administrador")]
    public async Task<ActionResult<List<Departamento>>> ObtenerTodos()
    {
        var lista = await _repositorio.ObtenerTodosAsync();
        return Ok(lista);
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = "empleado,supervisor,administrador")]
    public async Task<ActionResult<Departamento>> ObtenerPorId(int id)
    {
        var item = await _repositorio.ObtenerPorIdAsync(id);
        if (item is null) return NotFound("Departamento no encontrado.");
        return Ok(item);
    }

    [HttpPost]
    [Authorize(Roles = "supervisor,administrador")]
    public async Task<ActionResult<Departamento>> Crear([FromBody] DepartamentoCrearDto dto)
    {
        var nuevo = new Departamento
        {
            Nombre = dto.Nombre,
            Ubicacion = dto.Ubicacion,
            JefeDepartamento = dto.JefeDepartamento,
            Extension = dto.Extension
        };

        var creado = await _repositorio.CrearAsync(nuevo);
        return CreatedAtAction(nameof(ObtenerPorId), new { id = creado.DepartamentoId }, creado);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "supervisor,administrador")]
    public async Task<IActionResult> Actualizar(int id, [FromBody] DepartamentoActualizarDto dto)
    {
        var existente = await _repositorio.ObtenerPorIdAsync(id);
        if (existente is null) return NotFound("Departamento no encontrado.");

        var actualizado = new Departamento
        {
            DepartamentoId = id,
            Nombre = dto.Nombre,
            Ubicacion = dto.Ubicacion,
            JefeDepartamento = dto.JefeDepartamento,
            Extension = dto.Extension
        };

        var ok = await _repositorio.ActualizarAsync(actualizado);
        if (!ok) return BadRequest("No se pudo actualizar el departamento.");

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "administrador")]
    public async Task<IActionResult> Eliminar(int id)
    {
        var ok = await _repositorio.EliminarAsync(id);
        if (!ok) return NotFound("Departamento no encontrado.");
        return NoContent();
    }
}
