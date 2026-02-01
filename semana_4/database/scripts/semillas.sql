USE evaluacion_parcial_1;
GO

IF NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'administrador')
INSERT INTO roles (nombre, descripcion) VALUES ('administrador', 'Acceso total al sistema');

IF NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'supervisor')
INSERT INTO roles (nombre, descripcion) VALUES ('supervisor', 'Gestiona empleados y departamentos sin eliminar');

IF NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'empleado')
INSERT INTO roles (nombre, descripcion) VALUES ('empleado', 'Solo consulta información');

IF NOT EXISTS (SELECT 1 FROM usuarios WHERE username = 'admin')
INSERT INTO usuarios (username, password_hash, activo)
VALUES ('admin', 'admin123', 1);

IF NOT EXISTS (
    SELECT 1
    FROM usuario_roles ur
    JOIN usuarios u ON u.usuario_id = ur.usuario_id
    JOIN roles r ON r.rol_id = ur.rol_id
    WHERE u.username = 'admin' AND r.nombre = 'administrador'
)
INSERT INTO usuario_roles (usuario_id, rol_id)
SELECT u.usuario_id, r.rol_id
FROM usuarios u
         JOIN roles r ON r.nombre = 'administrador'
WHERE u.username = 'admin';
GO
