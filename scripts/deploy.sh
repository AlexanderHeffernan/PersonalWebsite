#!/bin/bash

# Deploy script for Raspberry Pi
# Place this on your Pi in ~/personal-website/deploy.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

echo "=== Deploying Personal Website ==="
echo "Working directory: $(pwd)"

# Use 'docker compose' (newer) or 'docker-compose' (legacy)
if docker compose version &>/dev/null; then
    COMPOSE="docker compose"
elif docker-compose version &>/dev/null; then
    COMPOSE="docker-compose"
else
    echo "Error: Docker Compose not found. Please install it:"
    echo "  sudo apt-get update"
    echo "  sudo apt-get install docker-compose-plugin"
    exit 1
fi

echo "Using: $COMPOSE"

echo "Pulling latest image..."
$COMPOSE pull

echo "Starting containers..."
$COMPOSE up -d

echo "Running migrations (entrypoint runs them automatically, this is a safety net)..."
$COMPOSE exec -T app node /app/scripts/migrate.js || echo "Migration completed or no migrations needed"

echo "Checking health..."
sleep 5
if curl -sf http://localhost:3000/api/health > /dev/null; then
    echo "✓ Deployment successful!"
else
    echo "✗ Health check failed"
    echo "Check logs: $COMPOSE logs -f"
    exit 1
fi

echo ""
echo "Current status:"
$COMPOSE ps
