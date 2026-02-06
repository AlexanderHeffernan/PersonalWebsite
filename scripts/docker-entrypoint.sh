#!/bin/sh
set -e

echo "Running database migrations..."
node /app/scripts/migrate.js

echo "Starting application..."
exec node /app/.output/server/index.mjs
