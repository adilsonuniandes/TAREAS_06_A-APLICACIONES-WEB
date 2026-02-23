namespace Backend.Models
{
    public class Factura
    {
        public int FacturaId { get; set; }
        public string NumeroFactura { get; set; } = null!;
        public DateTime FechaEmision { get; set; }

        public int? ClienteId { get; set; }
        public Cliente? Cliente { get; set; }

        public int? EmpleadoId { get; set; }
        public Empleado? Empleado { get; set; }

        public int? UsuarioId { get; set; }
        public Usuario? Usuario { get; set; }

        public decimal Subtotal { get; set; }
        public decimal Iva { get; set; }
        public decimal Descuento { get; set; }
        public decimal Total { get; set; }

        public string Estado { get; set; } = "EMITIDA";
        public string? Observacion { get; set; }

        public ICollection<FacturaDetalle> Detalles { get; set; } = new List<FacturaDetalle>();
    }
}