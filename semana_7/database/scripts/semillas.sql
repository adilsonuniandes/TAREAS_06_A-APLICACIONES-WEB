SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

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


USE evaluacion_parcial_1;
GO
SET NOCOUNT ON;

BEGIN TRAN;

-- Limpieza (para que el script corra 1 sola vez sin duplicar)
DELETE FROM factura_detalle;
DELETE FROM facturas;
DELETE FROM clientes;

DBCC CHECKIDENT ('factura_detalle', RESEED, 0);
DBCC CHECKIDENT ('facturas', RESEED, 0);
DBCC CHECKIDENT ('clientes', RESEED, 0);

------------------------------------------------------------
-- 1) CLIENTES (12)
------------------------------------------------------------
INSERT INTO clientes (identificacion, nombres, direccion, telefono, email)
VALUES
('0102030405',     'Juan Perez',                'Av. Amazonas y NN.UU.',                 '0981234567', 'juan.perez@mail.com'),
('0912345678',     'Maria Andrade',             'Cdla. Alborada, Guayaquil',             '0991112233', 'maria.andrade@mail.com'),
('1723456789',     'Carlos Mena',               'La Carolina, Quito',                     '0987776655', 'carlos.mena@mail.com'),
('1102345678',     'Diana Velez',               'Centro, Cuenca',                         '0992223344', 'diana.velez@mail.com'),
('1711111111',     'Ricardo Paredes',           'Cumbayá, Quito',                         '0983332211', 'ricardo.paredes@mail.com'),
('0922222222',     'Ana Burbano',               'Urdesa, Guayaquil',                      '0984445566', 'ana.burbano@mail.com'),
('1790012345001',  'Tech Solutions S.A.',       'Av. 6 de Diciembre, Quito',              '022345678',  'ventas@techsolutions.ec'),
('0998765432001',  'Andes Software Cia. Ltda.', 'Av. Francisco de Orellana, Guayaquil',   '042345678',  'info@andessoftware.ec'),
('0199999999001',  'Servicios Sierra S.A.',     'Av. Solano, Cuenca',                     '072345678',  'contacto@sierraserv.ec'),
('1791234567001',  'Comercial Pacifico S.A.',   'Av. del Bombero, Guayaquil',             '042998877',  'facturacion@pacifico.ec'),
('1795555555001',  'DataLab Ecuador S.A.S.',    'Av. República, Quito',                   '022112233',  'hola@datalab.ec'),
('1712345678001',  'Innovacion Austro Cia.',    'Remigio Crespo, Cuenca',                 '072665544',  'admin@austroinnov.ec');

------------------------------------------------------------
-- 2) FACTURAS (40)  (empleado_id y usuario_id en NULL para no romper FK si no existen)
------------------------------------------------------------
;WITH n AS (
    SELECT TOP (40) ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS n
    FROM sys.all_objects
)
INSERT INTO facturas
(numero_factura, fecha_emision, cliente_id, empleado_id, usuario_id, subtotal, iva, descuento, total, estado, observacion)
SELECT
    CONCAT('F001-', RIGHT(CONCAT('000000000', n.n), 9)) AS numero_factura,
    DATEADD(DAY, -n.n, CAST(GETDATE() AS DATE)) AS fecha_emision,
    ((n.n - 1) % 12) + 1 AS cliente_id,
    NULL AS empleado_id,
    NULL AS usuario_id,
    0, 0, 0, 0,
    CASE WHEN n.n % 13 = 0 THEN 'ANULADA'
         WHEN n.n % 7  = 0 THEN 'PAGADA'
         ELSE 'EMITIDA' END AS estado,
    CASE WHEN n.n % 5 = 0 THEN 'Servicio mensual'
         WHEN n.n % 3 = 0 THEN 'Soporte y mantenimiento'
         ELSE 'Venta de servicios' END AS observacion
FROM n;

------------------------------------------------------------
-- 3) DETALLE (2 a 4 líneas por factura) + IVA 15%
------------------------------------------------------------
;WITH f AS (
    SELECT factura_id
    FROM facturas
),
lineas AS (
    SELECT 1 AS l UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
)
INSERT INTO factura_detalle
(factura_id, descripcion, cantidad, precio_unitario, descuento_linea, iva_linea)
SELECT
    f.factura_id,
    CASE l.l
        WHEN 1 THEN 'Implementación / Configuración'
        WHEN 2 THEN 'Soporte técnico'
        WHEN 3 THEN 'Desarrollo de módulo'
        ELSE        'Capacitación'
    END AS descripcion,
    CAST(CASE
        WHEN l.l = 1 THEN 1
        WHEN l.l = 2 THEN 2
        WHEN l.l = 3 THEN 1
        ELSE 1
    END AS DECIMAL(18,2)) AS cantidad,
    CAST(CASE l.l
        WHEN 1 THEN 120.00 + (f.factura_id % 8)  * 10.00
        WHEN 2 THEN  35.00 + (f.factura_id % 10) *  5.00
        WHEN 3 THEN 180.00 + (f.factura_id % 6)  * 20.00
        ELSE         60.00 + (f.factura_id % 7)  *  8.00
    END AS DECIMAL(18,2)) AS precio_unitario,
    CAST(CASE
        WHEN (f.factura_id % 9 = 0) AND l.l IN (1,3) THEN 15.00
        WHEN (f.factura_id % 6 = 0) AND l.l = 2       THEN  8.00
        ELSE 0.00
    END AS DECIMAL(18,2)) AS descuento_linea,
    CAST(ROUND(
        (
          (CAST(CASE
                WHEN l.l = 1 THEN 1
                WHEN l.l = 2 THEN 2
                WHEN l.l = 3 THEN 1
                ELSE 1
           END AS DECIMAL(18,2))
           *
           CAST(CASE l.l
                WHEN 1 THEN 120.00 + (f.factura_id % 8)  * 10.00
                WHEN 2 THEN  35.00 + (f.factura_id % 10) *  5.00
                WHEN 3 THEN 180.00 + (f.factura_id % 6)  * 20.00
                ELSE         60.00 + (f.factura_id % 7)  *  8.00
           END AS DECIMAL(18,2))
          )
          -
          CAST(CASE
                WHEN (f.factura_id % 9 = 0) AND l.l IN (1,3) THEN 15.00
                WHEN (f.factura_id % 6 = 0) AND l.l = 2       THEN  8.00
                ELSE 0.00
          END AS DECIMAL(18,2))
        ) * 0.15
    ,2) AS DECIMAL(18,2)) AS iva_linea
FROM f
CROSS JOIN lineas l
WHERE l.l <= (2 + (f.factura_id % 3));  -- 2 a 4 líneas

------------------------------------------------------------
-- 4) ACTUALIZAR TOTALES EN CABECERA (subtotal/iva/descuento/total)
------------------------------------------------------------
;WITH agg AS (
    SELECT
        factura_id,
        CAST(ROUND(SUM((cantidad * precio_unitario) - descuento_linea), 2) AS DECIMAL(18,2)) AS subtotal_calc,
        CAST(ROUND(SUM(iva_linea), 2) AS DECIMAL(18,2)) AS iva_calc,
        CAST(ROUND(SUM(descuento_linea), 2) AS DECIMAL(18,2)) AS descuento_calc
    FROM factura_detalle
    GROUP BY factura_id
)
UPDATE f
SET
    f.subtotal = a.subtotal_calc,
    f.iva = a.iva_calc,
    f.descuento = a.descuento_calc,
    f.total = CAST(ROUND(a.subtotal_calc + a.iva_calc, 2) AS DECIMAL(18,2))
FROM facturas f
JOIN agg a ON a.factura_id = f.factura_id;

COMMIT;
GO