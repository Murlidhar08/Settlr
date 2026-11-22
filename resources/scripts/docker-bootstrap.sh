#!/bin/sh

# Exit immediately if a command exits with a non-zero status
set -e

# If running as root (standard Docker container startup), fix volume permissions and drop to unprivileged user 'node'
if [ "$(id -u)" = "0" ]; then
  # Ensure /app/uploads and subdirectories exist and are owned by node:node with write permissions
  mkdir -p /app/uploads/profile /app/uploads/document
  chown -R node:node /app/uploads
  chmod -R 775 /app/uploads

  # Re-execute bootstrap script as unprivileged node user
  if command -v su-exec >/dev/null 2>&1; then
    exec su-exec node "$0" "$@"
  elif command -v gosu >/dev/null 2>&1; then
    exec gosu node "$0" "$@"
  fi
fi

echo "Running database migrations..."
npm run db:deploy

echo "Starting the application..."
exec "$@"
