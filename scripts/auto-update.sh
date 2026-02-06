#!/bin/bash

# Auto-update script for Raspberry Pi
# Run via cron: */5 * * * * /home/pi/personal-website/scripts/auto-update.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

# Use 'docker compose' (newer) or 'docker-compose' (legacy)
if docker compose version &>/dev/null; then
    COMPOSE="docker compose"
elif docker-compose version &>/dev/null; then
    COMPOSE="docker-compose"
else
    echo "[$(date)] Error: Docker Compose not found"
    exit 1
fi

# Read image name from .env or use default
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi
IMAGE_NAME=${IMAGE_NAME:-ghcr.io/YOUR_GITHUB_USERNAME/personal-website:latest}

# Get current image digest
CURRENT_DIGEST=$(docker inspect --format='{{index .RepoDigests 0}}' "$IMAGE_NAME" 2>/dev/null || echo "none")

# Pull latest and get new digest
IMAGE_NAME=$IMAGE_NAME $COMPOSE pull -q
NEW_DIGEST=$(docker inspect --format='{{index .RepoDigests 0}}' "$IMAGE_NAME" 2>/dev/null || echo "none")

# Compare digests
if [ "$CURRENT_DIGEST" != "$NEW_DIGEST" ]; then
    echo "[$(date)] New version detected, updating..."
    cd "$SCRIPT_DIR/.."
    ./scripts/deploy.sh
    echo "[$(date)] Update complete"
else
    echo "[$(date)] No updates available"
fi
