#!/bin/bash

docker exec -i sqlserver_evaluacion /opt/mssql-tools18/bin/sqlcmd \
-S localhost -U sa -P "Password123!" -C < database/scripts/semillas_usuarios.sql
