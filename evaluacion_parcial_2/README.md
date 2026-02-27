# Evaluación Parcial 2 – Pregunta 10
## Sistema de Gestión de Alquiler de Vehículos

### Descripción

Sistema desarrollado con **.NET y Angular** para gestionar vehículos, clientes y alquileres.

Tablas principales:

- **Vehiculos** (vehiculo_id, marca, modelo, año, disponible)
- **Clientes** (cliente_id, nombre, apellido, licencia, telefono)
- **Alquileres** (alquiler_id, vehiculo_id, cliente_id, fecha_inicio, fecha_fin, activo)

Incluye:

- Login con JWT.
- Protección de rutas.
- CRUD de vehículos y clientes.
- Creación y cierre de alquileres.
- Reporte de alquileres con exportación CSV.
- Solo el administrador puede gestionar usuarios.

---

## Tecnologías

- Backend: .NET 8, Entity Framework Core, JWT.
- Base de datos: SQL Server.
- Frontend: Angular.
- Infraestructura: Docker.

---

## Cómo ejecutar

Levantar backend y base de datos:

```bash
cd docker
docker compose up -d --build
sh scripts/crear_bd.sh
sh scripts/sembrar_datos.sh 
```

Swagger:
```html
http://localhost:5001/swagger/index.html
```

Levantar frontend:
```bash
cd frontend-angular
npm install
ng serve
```

Aplicación:
```html
http://localhost:4200/inicio
```

Credenciales:
admin/admin123