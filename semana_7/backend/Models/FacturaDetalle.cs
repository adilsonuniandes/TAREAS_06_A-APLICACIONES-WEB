namespace Backend.Models
{
    public class FacturaDetalle
    {
        public int DetalleId { get; set; }

        public int FacturaId { get; set; }
        public Factura Factura { get; set; } = null!;

        public string Descripcion { get; set; } = null!;
        public decimal Cantidad { get; set; }
        public decimal PrecioUnitario { get; set; }
        public decimal DescuentoLinea { get; set; }
        public decimal IvaLinea { get; set; }

        // No necesitas mapear "total_linea" computada de SQL: la puedes calcular en el DTO
    }
}