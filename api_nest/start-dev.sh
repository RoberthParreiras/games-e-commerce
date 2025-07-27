#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

isbuild=$1

# Safely stop and remove old containers and networks
echo "Stopping existing containers..."
docker compose -f docker-compose.yml -f docker-compose.dev.yml down

if [ "$isbuild" == "no-build" ]; then
    echo "Starting docker compose for development"
    docker compose -f docker-compose.yml -f docker-compose.dev.yml up
    echo "Containers started successfully"
    exit 0
fi

echo "Building and starting docker compose for development"
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
echo "Build and start completed successfully"