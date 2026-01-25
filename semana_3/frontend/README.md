# Semana 3 – Frontend (CRUD Clientes) – HTML + CSS + JavaScript (POO) + Materialize + SweetAlert

## Autor
Adilson Guillermo Chico Ortiz | Sexto Ciclo – Ingeniería de Software

## Descripción
Frontend en **HTML + CSS + JavaScript** (usando **POO con clases**) para consumir el **backend .NET 8** y realizar el **CRUD completo** de la tabla `clientes` en SQL Server.

Incluye:
- Diseño **Material Design** (Materialize CSS)
- Alertas y confirmaciones con **SweetAlert2**
- **Modal** para Crear / Actualizar
- **DELETE real** (borra de la base de datos)
- **Loading** controlado (se muestra solo cuando hay operación)
- **Paginación** y **búsqueda**
- Columna informativa **Cliente: Vigente / Caducado** (sin botón para activar/desactivar)

## Requisitos
- Backend corriendo:
    - API: `http://localhost:5000/api/clientes`
    - Swagger: `http://localhost:5000/swagger`
- Servidor web para abrir el frontend (se sirve con el contenedor PHP del repositorio)

## Ejecución (Docker)
Desde la raíz del repositorio, levantar el servicio PHP (servidor estático):

```bash
docker compose up -d web
```