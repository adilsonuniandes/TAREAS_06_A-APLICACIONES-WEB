# Semana 6 
## Sistema de Gestión de Empleados (Angular + .NET + SQL Server)

### Enunciado
Sistema de Gestión de Empleados: Diseña un sistema usando .NET para gestionar departamentos y empleados, incluyendo asignaciones.

Tablas:
- Departamentos (departamento_id, nombre, ubicacion, jefe_departamento, extension)
- Empleados (empleado_id, nombre, apellido, email, telefono)
- Asignaciones (asignacion_id, empleado_id, departamento_id, fecha_asignacion)

Además:
- Login simple.
- Guardar nombre de usuario en localStorage.
- Validar sesión desde el backend.
- Roles: administrador, supervisor, empleado.
- Solo el administrador puede gestionar usuarios (CRUD de usuarios).

---

## Tecnologías utilizadas
- Backend: .NET 8 (ASP.NET Core Web API), Entity Framework Core, JWT.
- Base de datos: SQL Server.
- Frontend: Angular 19.0.4.
- Comunicación: API REST + Bearer Token (JWT).
- Infraestructura: Docker / Docker Compose.

Nota importante:
No se realizó el backend ejecutándolo de forma nativa en Windows, porque utilizo macOS (OSX). Para garantizar compatibilidad y ejecución estable, todo el backend y SQL Server se levantan con Docker.

---

## Cómo levantar el ambiente

### 1) Levantar infraestructura (SQL Server + Backend)
Desde la raíz del repositorio (donde está el docker-compose):

```bash
sh scripts/levantar_entorno.sh
sh scripts/crear_bd.sh
sh scripts/sembrar_datos.sh
sh scripts/sembrar_usuarios.sh
sh scripts/compilar_backend.sh
```

## Backend (Swagger):

http://localhost:5000/swagger

## Levantar el frontend Angular

Entrar a la carpeta del frontend Angular:

```bash
cd frontend-angular
npm install
ng serve --port 4200 --open
```

## Aplicación:

http://localhost:4200

---
## Credenciales de prueba

### Usuarios sembrados:

admin / admin123 (rol: administrador)

supervisor / supervisor123 (rol: supervisor)

empleado / empleado123 (rol: empleado)