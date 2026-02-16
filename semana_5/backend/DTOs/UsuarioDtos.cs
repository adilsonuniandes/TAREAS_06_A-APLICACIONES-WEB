namespace Backend.Models.Dtos
{
    public class UsuarioListadoDto
    {
        public int UsuarioId { get; set; }
        public string Username { get; set; } = string.Empty;
        public bool Activo { get; set; }
        public List<RolDto> Roles { get; set; } = new();
    }

    public class RolDto
    {
        public int RolId { get; set; }
        public string Nombre { get; set; } = string.Empty;
    }

    public class UsuarioCrearDto
    {
        public string Username { get; set; } = string.Empty;
        public string Contrasena { get; set; } = string.Empty;
        public bool Activo { get; set; } = true;

        // Admin asigna roles
        public List<int> RolIds { get; set; } = new();
    }

    public class UsuarioActualizarDto
    {
        public string Username { get; set; } = string.Empty;

        // Opcional: si viene vacío, NO cambia la contraseña
        public string? Contrasena { get; set; }

        public bool Activo { get; set; } = true;

        // Reemplaza roles (set completo)
        public List<int> RolIds { get; set; } = new();
    }
}
