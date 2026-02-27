using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models;

[Table("clientes")]
public class Cliente
{
    [Key]
    [Column("cliente_id")]
    public int ClienteId { get; set; }

    [Column("nombre")]
    public string Nombre { get; set; } = null!;

    [Column("apellido")]
    public string Apellido { get; set; } = null!;

    [Column("licencia")]
    public string Licencia { get; set; } = null!;

    [Column("telefono")]
    public string? Telefono { get; set; }

    public ICollection<Alquiler>? Alquileres { get; set; }
}