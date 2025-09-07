#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Safely stop and remove old containers and networks
echo "Stopping existing containers..."
docker compose -f docker-compose.nginx.yml -f docker-compose.prod.yml down

docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.nginx.yml up
echo "Build and start completed successfully"