#!/usr/bin/env bash
set -e

# Si usas Colima, descomenta estas 2 lineas:
# echo "Verificando Colima..."
# colima status >/dev/null 2>&1 || colima start

echo "Levantando SQL Server (Docker) para Semana 2..."
docker compose up -d sqlserver

echo "Levantando PHP (Docker) para Semana 2..."
docker compose up -d php

echo ""
echo "URL backend (prueba rápida):"
echo "http://localhost:8000/semana_2/backend/controllers/pais.controller.php?op=todos"
echo ""
echo "URL frontend:"
echo "http://localhost:8000/semana_2/frontend/index.html"
