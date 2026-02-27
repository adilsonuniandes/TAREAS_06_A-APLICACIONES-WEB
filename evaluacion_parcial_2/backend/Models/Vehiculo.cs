using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models;

[Table("vehiculos")]
public class Vehiculo
{
    [Key]
    [Column("vehiculo_id")]
    public int VehiculoId { get; set; }

    [Column("marca")]
    public string Marca { get; set; } = null!;

    [Column("modelo")]
    public string Modelo { get; set; } = null!;

    [Column("anio")]
    public int Anio { get; set; }

    [Column("disponible")]
    public bool Disponible { get; set; } = true;

    public ICollection<Alquiler>? Alquileres { get; set; }
}