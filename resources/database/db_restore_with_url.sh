#!/bin/bash

# Usage:
#   ./db_restore_with_url.sh <backup_file> [database_url]
#
# Supported backup formats:
#   - PostgreSQL custom-format dumps (.dump, .backup)
#   - Plain-text SQL dumps (.sql)
#   - Tar archives (.tar)
#   - Compressed archives (.gz, .dump.gz, .sql.gz, .tar.gz)

# Check arguments
if [ -z "$1" ]; then
  echo "Usage: $0 <backup_file> [database_url]"
  echo "Supported formats: .dump, .sql, .tar, .dump.gz, .sql.gz, .tar.gz"
  echo "Example: $0 ./resources/database/db_backup/property_hub.dump 'postgresql://user:pass@host:5432/dbname'"
  exit 1
fi

BACKUP_FILE="$1"
DATABASE_URL="$2"

# Check if file or directory exists
if [ ! -f "$BACKUP_FILE" ] && [ ! -d "$BACKUP_FILE" ]; then
  echo "Error: Backup file or directory '$BACKUP_FILE' not found!"
  exit 1
fi

if [ -z "$DATABASE_URL" ]; then
  read -r -p "Enter Database Connection String (URL): " DATABASE_URL
fi

if [ -z "$DATABASE_URL" ]; then
  echo "Error: Database URL is required."
  exit 1
fi

# Sanitize URL: pg_restore/psql do not support pgbouncer, pool, or direct query parameters
CLEAN_DB_URL=$(echo "$DATABASE_URL" | \
  sed -E 's/([?&])(pgbouncer|pool|direct)=[^&]*(&)?/\1/g' | \
  sed -E 's/\?&/?/g' | \
  sed -E 's/[?&]$//g')

# Ensure PostgreSQL binaries (psql and pg_restore) are in PATH
if ! command -v psql >/dev/null 2>&1 || ! command -v pg_restore >/dev/null 2>&1; then
  for pg_dir in "/c/Program Files/PostgreSQL/"*"/bin" "/c/Program Files (x86)/PostgreSQL/"*"/bin"; do
    if [ -d "$pg_dir" ]; then
      PATH="$pg_dir:$PATH"
    fi
  done
fi

echo "------------------------------------"
echo "Restoring '$BACKUP_FILE' using connection string..."
echo "------------------------------------"

USE_PG_RESTORE=false

# Check if file is gzipped
if [[ "$BACKUP_FILE" == *.gz ]]; then
  if gunzip -c "$BACKUP_FILE" 2>/dev/null | head -c 5 | grep -q "PGDMP" || gunzip -c "$BACKUP_FILE" 2>/dev/null | pg_restore -l >/dev/null 2>&1; then
    echo "Detected compressed PostgreSQL custom-format dump (.gz). Restoring using pg_restore..."
    USE_PG_RESTORE=true
    gunzip -c "$BACKUP_FILE" | pg_restore --clean --if-exists --no-owner --no-privileges --dbname="$CLEAN_DB_URL"
  else
    echo "Detected compressed plain-text SQL (.gz). Restoring using psql..."
    gunzip -c "$BACKUP_FILE" | psql "$CLEAN_DB_URL"
  fi
# Check if file is custom dump, tar, directory, or starts with PGDMP header
elif [ -d "$BACKUP_FILE" ] || pg_restore -l "$BACKUP_FILE" >/dev/null 2>&1 || [ "$(head -c 5 "$BACKUP_FILE" 2>/dev/null)" = "PGDMP" ] || [[ "$BACKUP_FILE" == *.dump ]] || [[ "$BACKUP_FILE" == *.backup ]] || [[ "$BACKUP_FILE" == *.tar ]]; then
  echo "Detected PostgreSQL archive/custom dump format. Restoring using pg_restore..."
  USE_PG_RESTORE=true
  pg_restore --clean --if-exists --no-owner --no-privileges --dbname="$CLEAN_DB_URL" "$BACKUP_FILE"
else
  echo "Detected plain-text SQL dump. Restoring using psql..."
  psql "$CLEAN_DB_URL" -f "$BACKUP_FILE"
fi

RESTORE_STATUS=$?

# Check status
# For pg_restore: 0 = success, 1 = completed with non-fatal warnings (e.g. existing objects, role notices)
if [ "$USE_PG_RESTORE" = true ]; then
  if [ $RESTORE_STATUS -eq 0 ]; then
    echo "✅ Restore completed successfully!"
  elif [ $RESTORE_STATUS -eq 1 ]; then
    echo "⚠️ Restore completed with warnings (non-fatal notices such as pre-existing objects or ownership)."
  else
    echo "❌ Restore failed with exit code $RESTORE_STATUS!"
    exit $RESTORE_STATUS
  fi
else
  if [ $RESTORE_STATUS -eq 0 ]; then
    echo "✅ Restore completed successfully!"
  else
    echo "❌ Restore failed with exit code $RESTORE_STATUS!"
    exit $RESTORE_STATUS
  fi
fi