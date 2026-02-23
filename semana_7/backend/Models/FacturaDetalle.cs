namespace Backend.Models
{
    public class FacturaDetalle
    {
        public int DetalleId { get; set; }
        public int FacturaId { get; set; }

        public string Descripcion { get; set; } = "";
        public decimal Cantidad { get; set; }
        public decimal PrecioUnitario { get; set; }
        public decimal DescuentoLinea { get; set; }
        public decimal IvaLinea { get; set; }
        public decimal TotalLinea { get; private set; }

        public Factura? Factura { get; set; }
    }
}