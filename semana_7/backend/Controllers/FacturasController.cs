using Backend.Data;
using Backend.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FacturasController : ControllerBase
    {
        private readonly AppDbContext _db;

        public FacturasController(AppDbContext db)
        {
            _db = db;
        }

        // GET: /api/facturas
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> Listar()
        {
            var lista = await _db.Facturas
                .AsNoTracking()
                .OrderByDescending(f => f.FacturaId)
                .Select(f => new
                {
                    facturaId = f.FacturaId,
                    numeroFactura = f.NumeroFactura,
                    fechaEmision = f.FechaEmision,
                    estado = f.Estado,
                    total = f.Total
                })
                .ToListAsync();

            return Ok(lista);
        }

        // GET: /api/facturas/1/reporte
        [HttpGet("{facturaId:int}/reporte")]
        public async Task<ActionResult<FacturaReporteDto>> ObtenerReporte(int facturaId)
        {
            var factura = await _db.Facturas
                .Include(f => f.Cliente)
                .Include(f => f.Empleado)
                .Include(f => f.Usuario)
                .Include(f => f.Detalles)
                .FirstOrDefaultAsync(f => f.FacturaId == facturaId);

            if (factura == null) return NotFound("Factura no encontrada");

            var dto = new FacturaReporteDto
            {
                FacturaId = factura.FacturaId,
                NumeroFactura = factura.NumeroFactura,
                FechaEmision = factura.FechaEmision,
                Estado = factura.Estado,
                Subtotal = factura.Subtotal,
                Descuento = factura.Descuento,
                Iva = factura.Iva,
                Total = factura.Total,
                Observacion = factura.Observacion,
                Cliente = new ClienteDto
                {
                    Identificacion = factura.Cliente?.Identificacion ?? "",
                    Nombres = factura.Cliente?.Nombres ?? "",
                    Direccion = factura.Cliente?.Direccion,
                    Telefono = factura.Cliente?.Telefono,
                    Email = factura.Cliente?.Email
                },
                Emisor = new EmisorDto
                {
                    // ✅ CORREGIDO: PascalCase
                    Empleado = factura.Empleado != null ? $"{factura.Empleado.Nombre} {factura.Empleado.Apellido}" : null,
                    Usuario = factura.Usuario != null ? factura.Usuario.Username : null
                },
                Detalles = factura.Detalles.Select(d => new FacturaLineaDto
                {
                    Descripcion = d.Descripcion,
                    Cantidad = d.Cantidad,
                    PrecioUnitario = d.PrecioUnitario,
                    DescuentoLinea = d.DescuentoLinea,
                    IvaLinea = d.IvaLinea,
                    TotalLinea = (d.Cantidad * d.PrecioUnitario) - d.DescuentoLinea + d.IvaLinea
                }).ToList()
            };

            return Ok(dto);
        }
    }
}