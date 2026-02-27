USE evaluacion_parcial_2_db;
GO

IF NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'administrador')
INSERT INTO roles (nombre, descripcion)
VALUES ('administrador', 'Acceso total al sistema');

IF NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'operador')
INSERT INTO roles (nombre, descripcion)
VALUES ('operador', 'Gestiona vehículos, clientes y alquileres');

IF NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'consulta')
INSERT INTO roles (nombre, descripcion)
VALUES ('consulta', 'Solo consulta información');

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

IF NOT EXISTS (SELECT 1 FROM vehiculos)
INSERT INTO vehiculos (marca, modelo, anio, disponible)
VALUES
('Toyota', 'Corolla', 2022, 1),
('Chevrolet', 'Aveo', 2021, 1),
('Kia', 'Sportage', 2023, 1);

IF NOT EXISTS (SELECT 1 FROM clientes)
INSERT INTO clientes (nombre, apellido, licencia, telefono)
VALUES
('Carlos', 'Mendoza', 'LIC123456', '0991111111'),
('Andrea', 'Pérez', 'LIC654321', '0982222222');
GO