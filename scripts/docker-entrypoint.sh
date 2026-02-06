#!/bin/sh
set -e

echo "Ensuring data directories exist..."
mkdir -p /app/data/uploads/projects
mkdir -p /app/data/uploads/writing

# Migrate any existing uploads from the old public/ location to data/
if [ -d "/app/.output/public/uploads" ]; then
  echo "Migrating existing uploads from .output/public/uploads to data/uploads..."
  cp -rn /app/.output/public/uploads/* /app/data/uploads/ 2>/dev/null || true
  echo "✓ Upload migration complete"
fi

echo "Running database migrations..."
node /app/scripts/migrate.js

echo "Starting application..."
exec node /app/.output/server/index.mjs
