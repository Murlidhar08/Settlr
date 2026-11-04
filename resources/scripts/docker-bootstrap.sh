#!/bin/sh

# Exit immediately if a command exits with a non-zero status
set -e

echo "Running database migrations..."
npm run db:deploy

echo "Starting the application..."
exec "$@"
