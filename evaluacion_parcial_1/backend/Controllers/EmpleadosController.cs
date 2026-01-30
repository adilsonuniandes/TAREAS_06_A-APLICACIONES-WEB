using Backend.DTOs;
using Backend.Models;
using Backend.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/empleados")]
public class EmpleadosController : ControllerBase
{
    private readonly IEmpleadoRepositorio _repositorio;

    public EmpleadosController(IEmpleadoRepositorio repositorio)
    {
        _repositorio = repositorio;
    }

    [HttpGet]
    [Authorize(Roles = "empleado,supervisor,administrador")]
    public async Task<ActionResult<List<Empleado>>> ObtenerTodos()
    {
        var lista = await _repositorio.ObtenerTodosAsync();
        return Ok(lista);
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = "empleado,supervisor,administrador")]
    public async Task<ActionResult<Empleado>> ObtenerPorId(int id)
    {
        var item = await _repositorio.ObtenerPorIdAsync(id);
        if (item is null) return NotFound("Empleado no encontrado.");
        return Ok(item);
    }

    [HttpPost]
    [Authorize(Roles = "supervisor,administrador")]
    public async Task<ActionResult<Empleado>> Crear([FromBody] EmpleadoCrearDto dto)
    {
        if (await _repositorio.ExisteEmailAsync(dto.Email))
            return Conflict("El correo ya está registrado.");

        var nuevo = new Empleado
        {
            Nombre = dto.Nombre,
            Apellido = dto.Apellido,
            Email = dto.Email,
            Telefono = dto.Telefono
        };

        var creado = await _repositorio.CrearAsync(nuevo);
        return CreatedAtAction(nameof(ObtenerPorId), new { id = creado.EmpleadoId }, creado);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "supervisor,administrador")]
    public async Task<IActionResult> Actualizar(int id, [FromBody] EmpleadoActualizarDto dto)
    {
        var existente = await _repositorio.ObtenerPorIdAsync(id);
        if (existente is null) return NotFound("Empleado no encontrado.");

        if (await _repositorio.ExisteEmailAsync(dto.Email, id))
            return Conflict("El correo ya está registrado.");

        var actualizado = new Empleado
        {
            EmpleadoId = id,
            Nombre = dto.Nombre,
            Apellido = dto.Apellido,
            Email = dto.Email,
            Telefono = dto.Telefono
        };

        var ok = await _repositorio.ActualizarAsync(actualizado);
        if (!ok) return BadRequest("No se pudo actualizar el empleado.");

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "administrador")]
    public async Task<IActionResult> Eliminar(int id)
    {
        var ok = await _repositorio.EliminarAsync(id);
        if (!ok) return NotFound("Empleado no encontrado.");
        return NoContent();
    }
}
