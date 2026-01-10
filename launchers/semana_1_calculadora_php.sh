#!/usr/bin/env bash
set -e

echo "Levantando PHP (Docker) para Semana 1..."
docker compose up -d php

echo ""
echo "URL:"
echo "http://localhost:8000/semana_1/php_calculadora/"
