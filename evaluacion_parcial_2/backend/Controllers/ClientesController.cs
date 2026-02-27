using Backend.DTOs;
using Backend.Models;
using Backend.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ClientesController : ControllerBase
{
    private readonly IClienteRepositorio _repo;

    public ClientesController(IClienteRepositorio repo)
    {
        _repo = repo;
    }

    [HttpGet]
    public async Task<IActionResult> Obtener()
        => Ok(await _repo.ObtenerTodos());

    [HttpGet("{id}")]
    public async Task<IActionResult> ObtenerPorId(int id)
    {
        var c = await _repo.ObtenerPorId(id);
        if (c == null) return NotFound();
        return Ok(c);
    }

    [HttpPost]
    public async Task<IActionResult> Crear(ClienteCrearDto dto)
    {
        var cliente = new Cliente
        {
            Nombre = dto.Nombre,
            Apellido = dto.Apellido,
            Licencia = dto.Licencia,
            Telefono = dto.Telefono
        };

        await _repo.Crear(cliente);
        return Ok(cliente);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Actualizar(int id, ClienteActualizarDto dto)
    {
        var c = await _repo.ObtenerPorId(id);
        if (c == null) return NotFound();

        c.Nombre = dto.Nombre;
        c.Apellido = dto.Apellido;
        c.Licencia = dto.Licencia;
        c.Telefono = dto.Telefono;

        await _repo.Actualizar(c);
        return Ok(c);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Eliminar(int id)
    {
        await _repo.Eliminar(id);
        return NoContent();
    }
}