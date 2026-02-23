USE evaluacion_parcial_1;
GO

IF NOT EXISTS (SELECT 1 FROM usuarios WHERE username = 'supervisor')
INSERT INTO usuarios (username, password_hash, activo)
VALUES ('supervisor', 'supervisor123', 1);

IF NOT EXISTS (SELECT 1 FROM usuarios WHERE username = 'empleado')
INSERT INTO usuarios (username, password_hash, activo)
VALUES ('empleado', 'empleado123', 1);

IF NOT EXISTS (
    SELECT 1
    FROM usuario_roles ur
    JOIN usuarios u ON u.usuario_id = ur.usuario_id
    JOIN roles r ON r.rol_id = ur.rol_id
    WHERE u.username = 'supervisor' AND r.nombre = 'supervisor'
)
INSERT INTO usuario_roles (usuario_id, rol_id)
SELECT u.usuario_id, r.rol_id
FROM usuarios u
         JOIN roles r ON r.nombre = 'supervisor'
WHERE u.username = 'supervisor';

IF NOT EXISTS (
    SELECT 1
    FROM usuario_roles ur
    JOIN usuarios u ON u.usuario_id = ur.usuario_id
    JOIN roles r ON r.rol_id = ur.rol_id
    WHERE u.username = 'empleado' AND r.nombre = 'empleado'
)
INSERT INTO usuario_roles (usuario_id, rol_id)
SELECT u.usuario_id, r.rol_id
FROM usuarios u
         JOIN roles r ON r.nombre = 'empleado'
WHERE u.username = 'empleado';
GO
