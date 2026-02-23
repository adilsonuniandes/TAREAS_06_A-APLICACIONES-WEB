namespace Backend.DTOs
{
    public class FacturaReporteDto
    {
        public int FacturaId { get; set; }
        public string NumeroFactura { get; set; } = null!;
        public DateTime FechaEmision { get; set; }
        public string Estado { get; set; } = null!;

        public ClienteDto Cliente { get; set; } = new();
        public EmisorDto Emisor { get; set; } = new();

        public decimal Subtotal { get; set; }
        public decimal Descuento { get; set; }
        public decimal Iva { get; set; }
        public decimal Total { get; set; }

        public string? Observacion { get; set; }

        public List<FacturaLineaDto> Detalles { get; set; } = new();
    }

    public class ClienteDto
    {
        public string Identificacion { get; set; } = "";
        public string Nombres { get; set; } = "";
        public string? Direccion { get; set; }
        public string? Telefono { get; set; }
        public string? Email { get; set; }
    }

    public class EmisorDto
    {
        public string? Empleado { get; set; }
        public string? Usuario { get; set; }
    }

    public class FacturaLineaDto
    {
        public string Descripcion { get; set; } = "";
        public decimal Cantidad { get; set; }
        public decimal PrecioUnitario { get; set; }
        public decimal DescuentoLinea { get; set; }
        public decimal IvaLinea { get; set; }
        public decimal TotalLinea { get; set; }
    }
}