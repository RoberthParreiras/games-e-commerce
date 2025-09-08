#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Safely stop and remove old containers and volumes
echo "Stopping existing containers..."
docker compose -f docker-compose.nginx.yml -f docker-compose.prod.yml down
docker volume rm next_static_volume || true

docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.nginx.yml up -d
echo "Build and start completed successfully"