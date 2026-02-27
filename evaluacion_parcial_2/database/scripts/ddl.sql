IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'evaluacion_parcial_2_db')
BEGIN
    CREATE DATABASE evaluacion_parcial_2_db;
END
GO

USE evaluacion_parcial_2_db;
GO

/* =========================
   TABLAS DE SEGURIDAD (LOGIN)
   ========================= */

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'roles')
BEGIN
CREATE TABLE roles (
                       rol_id INT IDENTITY PRIMARY KEY,
                       nombre VARCHAR(50) NOT NULL UNIQUE,
                       descripcion VARCHAR(150)
);
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'usuarios')
BEGIN
CREATE TABLE usuarios (
                          usuario_id INT IDENTITY PRIMARY KEY,
                          username VARCHAR(50) NOT NULL UNIQUE,
                          password_hash VARCHAR(255) NOT NULL,
                          activo BIT NOT NULL DEFAULT 1,
                          fecha_creacion DATETIME NOT NULL DEFAULT GETDATE()
);
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'usuario_roles')
BEGIN
CREATE TABLE usuario_roles (
                               usuario_id INT NOT NULL,
                               rol_id INT NOT NULL,
                               CONSTRAINT pk_usuario_roles PRIMARY KEY (usuario_id, rol_id),
                               CONSTRAINT fk_ur_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(usuario_id),
                               CONSTRAINT fk_ur_rol FOREIGN KEY (rol_id) REFERENCES roles(rol_id)
);
END
GO


/* =========================
   TABLAS DEL SISTEMA
   ========================= */

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'vehiculos')
BEGIN
CREATE TABLE vehiculos (
                           vehiculo_id INT IDENTITY PRIMARY KEY,
                           marca VARCHAR(100) NOT NULL,
                           modelo VARCHAR(100) NOT NULL,
                           anio INT NOT NULL,
                           disponible BIT NOT NULL DEFAULT 1
);
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'clientes')
BEGIN
CREATE TABLE clientes (
                          cliente_id INT IDENTITY PRIMARY KEY,
                          nombre VARCHAR(100) NOT NULL,
                          apellido VARCHAR(100) NOT NULL,
                          licencia VARCHAR(50) NOT NULL UNIQUE,
                          telefono VARCHAR(20)
);
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'alquileres')
BEGIN
CREATE TABLE alquileres (
                            alquiler_id INT IDENTITY PRIMARY KEY,
                            vehiculo_id INT NOT NULL,
                            cliente_id INT NOT NULL,
                            fecha_inicio DATETIME NOT NULL DEFAULT GETDATE(),
                            fecha_fin DATETIME NULL,
                            activo BIT NOT NULL DEFAULT 1,

                            CONSTRAINT fk_alquiler_vehiculo
                                FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(vehiculo_id),

                            CONSTRAINT fk_alquiler_cliente
                                FOREIGN KEY (cliente_id) REFERENCES clientes(cliente_id)
);
END
GO