#!/bin/bash
set -e

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

echo "Borrando base evaluacion_parcial_1..."

docker exec -i sqlserver_evaluacion /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "Password123!" -C -Q "
IF DB_ID('evaluacion_parcial_1') IS NOT NULL
BEGIN
  ALTER DATABASE evaluacion_parcial_1 SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
  DROP DATABASE evaluacion_parcial_1;
END
"
echo "Base eliminada."