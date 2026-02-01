#!/bin/bash
echo "Compilando backend..."
docker compose -f docker/docker-compose.yml build --no-cache backend
docker compose -f docker/docker-compose.yml up -d
docker compose -f docker/docker-compose.yml restart frontend
echo "Backend compilado"