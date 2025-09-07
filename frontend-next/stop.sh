#!/bin/bash

set -e

echo "Stopping all docker compose services"

docker compose -f docker-compose.nginx.yml -f docker-compose.dev.yml down
docker compose -f docker-compose.nginx.yml -f docker-compose.prod.yml down --remove-orphans

echo "All services stopped successfully"