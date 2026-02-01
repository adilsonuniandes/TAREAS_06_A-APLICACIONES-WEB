IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'evaluacion_parcial_1')
BEGIN
    CREATE DATABASE evaluacion_parcial_1;
END
GO

USE evaluacion_parcial_1;
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'roles')
BEGIN
CREATE TABLE roles (
                       rol_id INT IDENTITY PRIMARY KEY,
                       nombre VARCHAR(50) NOT NULL UNIQUE,
                       descripcion VARCHAR(150)
);
END

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

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'departamentos')
BEGIN
CREATE TABLE departamentos (
                               departamento_id INT IDENTITY PRIMARY KEY,
                               nombre VARCHAR(100) NOT NULL,
                               ubicacion VARCHAR(100),
                               jefe_departamento VARCHAR(100),
                               extension VARCHAR(10)
);
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'empleados')
BEGIN
CREATE TABLE empleados (
                           empleado_id INT IDENTITY PRIMARY KEY,
                           nombre VARCHAR(100) NOT NULL,
                           apellido VARCHAR(100) NOT NULL,
                           email VARCHAR(150) NOT NULL UNIQUE,
                           telefono VARCHAR(20)
);
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'asignaciones')
BEGIN
CREATE TABLE asignaciones (
                              asignacion_id INT IDENTITY PRIMARY KEY,
                              empleado_id INT NOT NULL,
                              departamento_id INT NOT NULL,
                              fecha_asignacion DATETIME NOT NULL DEFAULT GETDATE(),
                              CONSTRAINT fk_asig_empleado FOREIGN KEY (empleado_id) REFERENCES empleados(empleado_id),
                              CONSTRAINT fk_asig_departamento FOREIGN KEY (departamento_id) REFERENCES departamentos(departamento_id),
                              CONSTRAINT uq_empleado_departamento UNIQUE (empleado_id, departamento_id)
);
END
