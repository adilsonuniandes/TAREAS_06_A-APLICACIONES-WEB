using Microsoft.AspNetCore.Mvc;
using Backend.Data;
using Backend.Models;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ClientesController : ControllerBase
{
    private readonly ClienteRepository _repo;

    public ClientesController(ClienteRepository repo)
    {
        _repo = repo;
    }

    [HttpGet]
    public async Task<ActionResult<List<Cliente>>> GetAll()
    {
        return await _repo.ObtenerTodosAsync();
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Cliente>> GetById(int id)
    {
        var c = await _repo.ObtenerPorIdAsync(id);
        if (c == null) return NotFound();
        return c;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Cliente c)
    {
        if (string.IsNullOrWhiteSpace(c.Empresa) ||
            string.IsNullOrWhiteSpace(c.Identificacion) ||
            string.IsNullOrWhiteSpace(c.Nombres) ||
            string.IsNullOrWhiteSpace(c.Apellidos))
        {
            return BadRequest("Empresa, Identificación, Nombres y Apellidos son obligatorios.");
        }

        // Si no viene activo, se queda en true para el update; en insert usa default de BD
        if (c.Activo == false) { /* permitido */ }

        var id = await _repo.CrearAsync(c);
        if (id == 0) return StatusCode(500, "No se pudo crear el cliente.");

        var creado = await _repo.ObtenerPorIdAsync(id);
        return CreatedAtAction(nameof(GetById), new { id }, creado);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] Cliente c)
    {
        if (string.IsNullOrWhiteSpace(c.Empresa) ||
            string.IsNullOrWhiteSpace(c.Identificacion) ||
            string.IsNullOrWhiteSpace(c.Nombres) ||
            string.IsNullOrWhiteSpace(c.Apellidos))
        {
            return BadRequest("Empresa, Identificación, Nombres y Apellidos son obligatorios.");
        }

        var rows = await _repo.ActualizarAsync(id, c);
        if (rows == 0) return NotFound();

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var rows = await _repo.EliminarAsync(id);
        if (rows == 0) return NotFound();
        return NoContent();
    }
}
