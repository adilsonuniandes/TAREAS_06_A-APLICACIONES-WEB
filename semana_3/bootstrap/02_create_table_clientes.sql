USE crud_semana_3;
GO

IF OBJECT_ID('dbo.clientes', 'U') IS NULL
BEGIN
CREATE TABLE dbo.clientes (
                              cliente_id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_clientes PRIMARY KEY,

                              empresa NVARCHAR(150) NOT NULL,
                              identificacion VARCHAR(20) NOT NULL,
                              nombres NVARCHAR(120) NOT NULL,
                              apellidos NVARCHAR(120) NOT NULL,

                              email NVARCHAR(160) NULL,
                              telefono NVARCHAR(30) NULL,
                              direccion NVARCHAR(200) NULL,

                              referido_por NVARCHAR(150) NULL,
                              canal_referencia NVARCHAR(50) NULL,

                              fecha_registro DATETIME2 NOT NULL CONSTRAINT DF_clientes_fecha DEFAULT (SYSDATETIME()),
                              activo BIT NOT NULL CONSTRAINT DF_clientes_activo DEFAULT (1),

                              CONSTRAINT CK_clientes_ident_len CHECK (LEN(identificacion) >= 5),
                              CONSTRAINT CK_clientes_nombres_len CHECK (LEN(nombres) >= 2),
                              CONSTRAINT CK_clientes_apellidos_len CHECK (LEN(apellidos) >= 2)
);

CREATE UNIQUE INDEX UX_clientes_empresa_identificacion
    ON dbo.clientes (empresa, identificacion);

CREATE INDEX IX_clientes_empresa
    ON dbo.clientes (empresa);

CREATE INDEX IX_clientes_apellidos
    ON dbo.clientes (apellidos);

CREATE INDEX IX_clientes_email
    ON dbo.clientes (email);
END
GO