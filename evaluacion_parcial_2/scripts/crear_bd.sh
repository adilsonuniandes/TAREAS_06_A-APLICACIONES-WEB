#!/bin/bash
set -euo pipefail

DDL_PATH="database/scripts/ddl.sql"

echo "Esperando a SQL Server..."

for i in {1..30}; do
  if docker exec sqlserver_evaluacion /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "Password123!" -C -Q "SELECT 1" > /dev/null 2>&1; then
    echo "SQL Server disponible"
    break
  fi
  sleep 2
done

if ! docker exec sqlserver_evaluacion /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "Password123!" -C -Q "SELECT 1" > /dev/null 2>&1; then
  echo "SQL Server no respondió"
  exit 1
fi

if [ ! -f "$DDL_PATH" ]; then
  echo "No existe: $DDL_PATH"
  exit 1
fi

docker exec -i sqlserver_evaluacion /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "Password123!" -C -b -i /dev/stdin < "$DDL_PATH"

echo "DDL ejecutada correctamente"