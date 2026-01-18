# Semana 2 – CRUD en PHP (HTML + CSS)

## Autor
Adilson Guillermo Chico Ortiz | Sexto Ciclo de Ingenieria de Software


## Objetivo de la tarea
Usted debe usar POO para crear el objeto Cliente y usarlo para crear los métodos para crear el CRUD.

## Descripción general

El proyecto implementa un **CRUD web** con separación clara de responsabilidades:

- **Backend (PHP)**

    - Uso de **POO** para encapsular la lógica de acceso a datos.

    - Controladores que exponen operaciones CRUD mediante parámetros (`op`).

    - Conexión a **SQL Server** usando PDO.

- **Frontend (HTML, CSS, JavaScript)**

    - Interfaz limpia y profesional.

    - Listado con paginación y búsqueda.

    - Formularios en **modales** para crear y actualizar registros.

    - Diálogo de confirmación para eliminación.

    - Indicador de carga (_loading_) y notificaciones visuales.

- **Base de datos**

    - SQL Server ejecutándose en Docker.

    - Scripts de **bootstrap** para creación de base, tablas y carga inicial de datos.

La lógica se implementa en `index.php` utilizando variables en español y control de flujo (`if`, `elseif`), y la vista se estiliza con `css/styles.css`.

## Tecnologías utilizadas

- PHP 8 (POO, PDO)

- SQL Server

- HTML5 / CSS3 / JavaScript

- Docker & Docker Compose


---

## Ejecución de la tarea (Docker)

Desde la **raíz del repositorio**:

`./launchers/semana_2_crud_php.sh`

Este script:

1. Levanta el contenedor de **SQL Server**.

2. Levanta el contenedor de **PHP**.

3. Permite acceder al backend y frontend desde el navegador.


---

## Accesos

- **Frontend**

  `http://localhost:8000/semana_2/frontend/index.html`

- **Backend (ejemplo – listar registros)**

  `http://localhost:8000/semana_2/backend/controllers/pais.controller.php?op=todos`