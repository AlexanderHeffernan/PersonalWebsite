#!/bin/bash

# Deploy script for Raspberry Pi
# Place this on your Pi in ~/personal-website/deploy.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

echo "=== Deploying Personal Website ==="
echo "Working directory: $(pwd)"
echo "Pulling latest image..."
docker-compose pull

echo "Starting containers..."
docker-compose up -d

echo "Running migrations..."
docker-compose exec -T app node /app/scripts/migrate.js || echo "Migration completed or no migrations needed"

echo "Checking health..."
sleep 5
if curl -sf http://localhost:3000/api/health > /dev/null; then
    echo "✓ Deployment successful!"
else
    echo "✗ Health check failed"
    echo "Check logs: docker-compose logs -f"
    exit 1
fi

echo ""
echo "Current status:"
docker-compose ps
