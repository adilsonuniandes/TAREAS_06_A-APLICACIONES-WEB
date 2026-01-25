# Semana 3 – Backend (API CRUD Clientes) – C# .NET 8 + SQL Server (Docker)

## Autor
Adilson Guillermo Chico Ortiz | Sexto Ciclo – Ingeniería de Software

## Descripción
Backend en **C# (.NET 8 Web API)** que expone un **CRUD completo** sobre la tabla `dbo.clientes` en **SQL Server**.  
Incluye **Swagger** para pruebas rápidas y **CORS habilitado** para consumirlo desde el frontend.

## Endpoints
Base URL: `http://localhost:5000`

- `GET    /api/clientes` → Lista clientes
- `GET    /api/clientes/{id}` → Obtiene cliente por id
- `POST   /api/clientes` → Crea cliente
- `PUT    /api/clientes/{id}` → Actualiza cliente
- `DELETE /api/clientes/{id}` → Elimina cliente (DELETE real)

Swagger:
- `http://localhost:5000/swagger`

## Requisitos
- Docker / Docker Compose (en Mac puede ser Docker Desktop o Colima)
- El contenedor `sqlserver` configurado en `docker-compose.yml`
- Base de datos: `crud_semana_3` (bootstrap SQL ejecutado previamente)

## Configuración (conexión a SQL Server)
En `semana_3/backend/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=sqlserver,1433;Database=crud_semana_3;User Id=sa;Password=P@ssw0rd123!;TrustServerCertificate=True;"
  }
}
```
## Validación rápida (curl)

Listar:
```bash
curl -s http://localhost:5000/api/clientes

```