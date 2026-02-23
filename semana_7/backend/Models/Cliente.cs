namespace Backend.Models
{
    public class Cliente
    {
        public int ClienteId { get; set; }
        public string Identificacion { get; set; } = null!;
        public string Nombres { get; set; } = null!;
        public string? Direccion { get; set; }
        public string? Telefono { get; set; }
        public string? Email { get; set; }

        public ICollection<Factura> Facturas { get; set; } = new List<Factura>();
    }
}