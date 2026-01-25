#!/usr/bin/env bash
set -e

# colima status >/dev/null 2>&1 || colima start

echo "inicia SQL Server..."
docker compose up -d sqlserver

echo "inicia Frontend (Nginx)..."
docker compose up -d web

echo "inicia dotnet (idle)..."
docker compose up -d dotnet

echo "ejecuta backend Semana 3 en http://localhost:5000 ..."
docker compose exec -T dotnet sh -lc "cd semana_3/backend && dotnet restore && dotnet run --urls http://0.0.0.0:5000" &
PID=$!

echo ""
echo "URLs:"
echo "Swagger:  http://localhost:5000/swagger"
echo "API:      http://localhost:5000/api/clientes"
echo "Frontend: http://localhost:8000/semana_3/frontend/index.html"
echo ""
echo "Para parar backend: kill $PID"
