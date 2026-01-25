# TAREAS 06 – Aplicaciones Web
## Semana 3 – CRUD Clientes (SQL Server + C# .NET 8 + Frontend Web)

## Autor
Adilson Guillermo Chico Ortiz  
Sexto Ciclo – Ingeniería de Software

---

## Objetivo de la tarea
Desarrollar un CRUD completo (Create, Read, Update, Delete) para la entidad Clientes, utilizando:
- SQL Server
- C# (.NET 8 Web API)
- HTML + CSS + JavaScript (POO)
- Infraestructura basada en Docker

---

## Descripción general del proyecto
El proyecto está organizado por áreas funcionales:
- bootstrap: scripts SQL para crear y poblar la base de datos
- backend: API REST en C# (.NET 8)
- frontend: interfaz web
- launchers: scripts para levantar servicios
- docker-compose.yml: infraestructura

El frontend consume el backend vía HTTP (JSON). El backend accede a SQL Server dentro del entorno Docker.

---

## Bootstrap (Base de Datos)
Archivo: bootstrap/semana_3.sql

Responsabilidades:
- Crear base de datos crud_semana_3
- Crear tabla dbo.clientes
- Definir claves, índices y constraints
- Definir valores por defecto

---

## Base de datos
Nombre: crud_semana_3  
Tabla: dbo.clientes

Campos principales:
- cliente_id (PK)
- empresa
- identificacion
- nombres
- apellidos
- email
- telefono
- direccion
- referido_por
- canal_referencia
- fecha_registro
- activo

El campo activo se usa solo como información visual (Vigente / Caducado).

---

## Backend (C# .NET 8 Web API)
Tecnologías:
- .NET 8
- ADO.NET (Microsoft.Data.SqlClient)
- Swagger
- CORS habilitado

Endpoints:
- GET /api/clientes
- GET /api/clientes/{id}
- POST /api/clientes
- PUT /api/clientes/{id}
- DELETE /api/clientes/{id}

Swagger:
http://localhost:5000/swagger

---

## Frontend
Tecnologías:
- HTML5
- CSS3
- JavaScript (POO)
- Materialize CSS
- SweetAlert2

Funciones:
- Listar clientes
- Crear, actualizar y eliminar clientes
- Modal para formularios
- Confirmaciones con SweetAlert
- Paginación y búsqueda
- Loading controlado
- Empty state solo cuando no hay datos

---

## Infraestructura (Docker)
Servicios:
- sqlserver
- dotnet
- php

Notas:
- SQL Server se accede por hostname sqlserver
- PHP se usa solo para servir archivos estáticos

---

## Launcher Backend
Archivo: launchers/semana_3_backend.sh

Responsabilidades:
- Levantar SQL Server
- Levantar backend .NET
- Ejecutar API en puerto 5000

Ejecución:
chmod +x launchers/semana_3.sh
```bash
sh ./launchers/semana_3.sh
```
---

## URLs
- Backend API: http://localhost:5000/api/clientes
- Swagger: http://localhost:5000/swagger
- Frontend: http://localhost:8000/semana_3/frontend/index.html

---

## Consideraciones finales
- CRUD completo con DELETE real
- POO en backend y frontend
- Base de datos inmutable desde el backend
- Proyecto reproducible con Docker
- Preparado para ejecución y defensa académica
