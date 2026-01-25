using Microsoft.Data.SqlClient;
using Backend.Models;

namespace Backend.Data;

public class ClienteRepository
{
    private readonly string _cs;

    public ClienteRepository(IConfiguration config)
    {
        _cs = config.GetConnectionString("DefaultConnection")
              ?? throw new Exception("Falta ConnectionStrings:DefaultConnection en appsettings.json");
    }

    private SqlConnection NewConn() => new SqlConnection(_cs);

    public async Task<List<Cliente>> ObtenerTodosAsync()
    {
        var list = new List<Cliente>();

        const string sql = @"
SELECT
  cliente_id,
  empresa,
  identificacion,
  nombres,
  apellidos,
  email,
  telefono,
  direccion,
  referido_por,
  canal_referencia,
  fecha_registro,
  activo
FROM dbo.clientes
ORDER BY cliente_id DESC;";

        using var cn = NewConn();
        await cn.OpenAsync();

        using var cmd = new SqlCommand(sql, cn);
        using var rd = await cmd.ExecuteReaderAsync();

        while (await rd.ReadAsync())
        {
            list.Add(new Cliente
            {
                ClienteId = rd.GetInt32(0),
                Empresa = rd.GetString(1),
                Identificacion = rd.GetString(2),
                Nombres = rd.GetString(3),
                Apellidos = rd.GetString(4),
                Email = rd.IsDBNull(5) ? null : rd.GetString(5),
                Telefono = rd.IsDBNull(6) ? null : rd.GetString(6),
                Direccion = rd.IsDBNull(7) ? null : rd.GetString(7),
                ReferidoPor = rd.IsDBNull(8) ? null : rd.GetString(8),
                CanalReferencia = rd.IsDBNull(9) ? null : rd.GetString(9),
                FechaRegistro = rd.GetDateTime(10),
                Activo = rd.GetBoolean(11)
            });
        }

        return list;
    }

    public async Task<Cliente?> ObtenerPorIdAsync(int id)
    {
        const string sql = @"
SELECT TOP 1
  cliente_id,
  empresa,
  identificacion,
  nombres,
  apellidos,
  email,
  telefono,
  direccion,
  referido_por,
  canal_referencia,
  fecha_registro,
  activo
FROM dbo.clientes
WHERE cliente_id = @id;";

        using var cn = NewConn();
        await cn.OpenAsync();

        using var cmd = new SqlCommand(sql, cn);
        cmd.Parameters.AddWithValue("@id", id);

        using var rd = await cmd.ExecuteReaderAsync();
        if (!await rd.ReadAsync()) return null;

        return new Cliente
        {
            ClienteId = rd.GetInt32(0),
            Empresa = rd.GetString(1),
            Identificacion = rd.GetString(2),
            Nombres = rd.GetString(3),
            Apellidos = rd.GetString(4),
            Email = rd.IsDBNull(5) ? null : rd.GetString(5),
            Telefono = rd.IsDBNull(6) ? null : rd.GetString(6),
            Direccion = rd.IsDBNull(7) ? null : rd.GetString(7),
            ReferidoPor = rd.IsDBNull(8) ? null : rd.GetString(8),
            CanalReferencia = rd.IsDBNull(9) ? null : rd.GetString(9),
            FechaRegistro = rd.GetDateTime(10),
            Activo = rd.GetBoolean(11)
        };
    }

    // CREATE: usa defaults de BD (fecha_registro, activo). Retorna el id nuevo.
    public async Task<int> CrearAsync(Cliente c)
    {
        const string sql = @"
INSERT INTO dbo.clientes
(empresa, identificacion, nombres, apellidos, email, telefono, direccion, referido_por, canal_referencia)
VALUES
(@empresa, @identificacion, @nombres, @apellidos, @email, @telefono, @direccion, @referido_por, @canal_referencia);

SELECT CAST(SCOPE_IDENTITY() AS INT);";

        using var cn = NewConn();
        await cn.OpenAsync();

        using var cmd = new SqlCommand(sql, cn);
        cmd.Parameters.AddWithValue("@empresa", c.Empresa);
        cmd.Parameters.AddWithValue("@identificacion", c.Identificacion);
        cmd.Parameters.AddWithValue("@nombres", c.Nombres);
        cmd.Parameters.AddWithValue("@apellidos", c.Apellidos);

        cmd.Parameters.AddWithValue("@email", (object?)c.Email ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@telefono", (object?)c.Telefono ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@direccion", (object?)c.Direccion ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@referido_por", (object?)c.ReferidoPor ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@canal_referencia", (object?)c.CanalReferencia ?? DBNull.Value);

        var idObj = await cmd.ExecuteScalarAsync();
        return idObj == null ? 0 : Convert.ToInt32(idObj);
    }

    // UPDATE: permite actualizar activo también (sin cambiar BD)
    public async Task<int> ActualizarAsync(int id, Cliente c)
    {
        const string sql = @"
UPDATE dbo.clientes
SET
  empresa = @empresa,
  identificacion = @identificacion,
  nombres = @nombres,
  apellidos = @apellidos,
  email = @email,
  telefono = @telefono,
  direccion = @direccion,
  referido_por = @referido_por,
  canal_referencia = @canal_referencia,
  activo = @activo
WHERE cliente_id = @id;";

        using var cn = NewConn();
        await cn.OpenAsync();

        using var cmd = new SqlCommand(sql, cn);
        cmd.Parameters.AddWithValue("@id", id);

        cmd.Parameters.AddWithValue("@empresa", c.Empresa);
        cmd.Parameters.AddWithValue("@identificacion", c.Identificacion);
        cmd.Parameters.AddWithValue("@nombres", c.Nombres);
        cmd.Parameters.AddWithValue("@apellidos", c.Apellidos);

        cmd.Parameters.AddWithValue("@email", (object?)c.Email ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@telefono", (object?)c.Telefono ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@direccion", (object?)c.Direccion ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@referido_por", (object?)c.ReferidoPor ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@canal_referencia", (object?)c.CanalReferencia ?? DBNull.Value);

        cmd.Parameters.AddWithValue("@activo", c.Activo);

        return await cmd.ExecuteNonQueryAsync();
    }

    // ✅ DELETE FÍSICO REAL (borra fila)
    public async Task<int> EliminarAsync(int id)
    {
        const string sql = @"DELETE FROM dbo.clientes WHERE cliente_id = @id;";

        using var cn = NewConn();
        await cn.OpenAsync();

        using var cmd = new SqlCommand(sql, cn);
        cmd.Parameters.AddWithValue("@id", id);

        return await cmd.ExecuteNonQueryAsync();
    }
}
