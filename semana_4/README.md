# Semana 4 - Tarea 1
Adilson Chico Ortiz

## Enunciado

En base al ejercicio trabajado en clase, tómelo como ejemplo, usted debe generar en la creación de un sistema en donde se contemple en uso de scaffolding. Uno de lo requerimientos es que la base de datos debe tener un máximo de 5 entidades y cada entidad con 5 atributos. Deben tener en cuenta que las entidades deben estar relacionadas entre si.

## Consideraciones técnicas

El desarrollo se realizó utilizando .NET mediante contenedores Docker, debido a que el sistema operativo utilizado es macOS (OSX), el cual no permite una instalación directa y nativa de SQL Server junto con el entorno completo requerido.
Docker nos da un entorno estable, reproducible y compatible con .NET y SQL Server.

## Tecnologías utilizadas

Backend:
- .NET 8 (ASP.NET Core Web API)
- Entity Framework Core
- Autenticación JWT
- Swagger para pruebas de la API

Base de datos:
- SQL Server

Frontend:
- HTML
- CSS
- JavaScript
- SweetAlert para confirmaciones

Infraestructura:
- Docker
- Docker Compose
- Scripts bash para automatización

## Levantamiento del entorno

El sistema se levanta completamente mediante Docker.

1. Levantar la infraestructura:
   sh scripts/levantar_entorno.sh

2. Crear la base de datos y tablas:
   sh scripts/crear_bd.sh

3. Cargar datos iniciales (semillas):
   Incluye departamentos, empleados, asignaciones, usuarios y roles.
   1. sh scripts/sembrar_datos.sh
   2. sh scripts/sembrar_usuarios.sh

## Seguridad y roles

El sistema cuenta con autenticación basada en JWT y control de acceso por roles.

Roles existentes:
- administrador: acceso completo (crear, editar, eliminar)
- supervisor: crear y editar
- empleado: solo lectura

### Usuarios de prueba:
- admin / admin123
- supervisor / supervisor123
- empleado / empleado123

## Funcionalidades implementadas

- CRUD de Departamentos
- CRUD de Empleados
- Gestión de Asignaciones
- Control de acceso por rol
- Interfaz web con buscador, paginación, modales y confirmaciones

## Documentación de la API

Swagger disponible en:
http://localhost:5000/swagger

## Conclusión

La solución cumple con el enunciado planteado, implementando un sistema funcional, seguro y organizado para la gestión de empleados, departamentos y asignaciones, utilizando .NET y buenas prácticas de desarrollo, adaptadas a un entorno macOS mediante Docker.
