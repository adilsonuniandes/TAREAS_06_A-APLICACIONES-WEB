#!/bin/bash
set -euo pipefail

SEED_PATH="database/scripts/semillas.sql"

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

if [ ! -f "$SEED_PATH" ]; then
  echo "No existe: $SEED_PATH"
  exit 1
fi

docker exec -i sqlserver_evaluacion /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "Password123!" -C -b -i /dev/stdin < "$SEED_PATH"

echo "Semillas ejecutadas correctamente"