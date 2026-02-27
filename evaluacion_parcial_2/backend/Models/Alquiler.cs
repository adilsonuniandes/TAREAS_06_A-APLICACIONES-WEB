using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models;

[Table("alquileres")]
public class Alquiler
{
    [Key]
    [Column("alquiler_id")]
    public int AlquilerId { get; set; }

    [Column("vehiculo_id")]
    public int VehiculoId { get; set; }

    public Vehiculo Vehiculo { get; set; } = null!;

    [Column("cliente_id")]
    public int ClienteId { get; set; }

    public Cliente Cliente { get; set; } = null!;

    [Column("fecha_inicio")]
    public DateTime FechaInicio { get; set; }

    [Column("fecha_fin")]
    public DateTime? FechaFin { get; set; }

    [Column("activo")]
    public bool Activo { get; set; }
}