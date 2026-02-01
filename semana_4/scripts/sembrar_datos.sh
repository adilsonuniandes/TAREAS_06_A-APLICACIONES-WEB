#!/bin/bash

echo "Esperando a SQL Server..."

for i in {1..30}
do
  docker exec sqlserver_evaluacion /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "Password123!" -C -Q "SELECT 1" > /dev/null 2>&1

  if [ $? -eq 0 ]; then
    echo "SQL Server disponible"
    break
  fi

  sleep 2
done

docker exec -i sqlserver_evaluacion /opt/mssql-tools18/bin/sqlcmd \
-S localhost -U sa -P "Password123!" -C < database/scripts/semillas.sql
