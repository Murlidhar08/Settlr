#!/bin/bash

# Usage:
#   ./db_restore.sh <backup_file>
#
# Supported formats: .dump, .sql, .tar, .dump.gz, .sql.gz, .tar.gz

# Check if filename is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <backup_file>"
  echo "Supported formats: .dump, .sql, .tar, .dump.gz, .sql.gz, .tar.gz"
  exit 1
fi

BACKUP_FILE="$1"

# Check if the file or directory exists
if [ ! -f "$BACKUP_FILE" ] && [ ! -d "$BACKUP_FILE" ]; then
  echo "Error: Backup file or directory '$BACKUP_FILE' not found!"
  exit 1
fi

# Ensure PostgreSQL binaries are in PATH
if ! command -v psql >/dev/null 2>&1 || ! command -v pg_restore >/dev/null 2>&1; then
  for pg_dir in "/c/Program Files/PostgreSQL/"*"/bin" "/c/Program Files (x86)/PostgreSQL/"*"/bin"; do
    if [ -d "$pg_dir" ]; then
      PATH="$pg_dir:$PATH"
    fi
  done
fi

# Prompt for connection details
echo "--- PostgreSQL Connection Details ---"
read -p "Server Host (default: localhost): " PGHOST
PGHOST=${PGHOST:-localhost}

read -p "Port (default: 5432): " PGPORT
PGPORT=${PGPORT:-5432}

read -p "Username (default: postgres): " PGUSER
PGUSER=${PGUSER:-postgres}

read -p "Database Name: " PGDB
if [ -z "$PGDB" ]; then
    echo "Error: Database name is required."
    exit 1
fi

read -s -p "Password: " PGPASSWORD
echo "" # New line after hidden password input

# Export password so psql and pg_restore don't prompt again
export PGPASSWORD

echo "------------------------------------"
echo "Restoring '$BACKUP_FILE' to database '$PGDB' on $PGHOST:$PGPORT..."
echo "------------------------------------"

USE_PG_RESTORE=false

# Check if file is gzipped
if [[ "$BACKUP_FILE" == *.gz ]]; then
  if gunzip -c "$BACKUP_FILE" 2>/dev/null | head -c 5 | grep -q "PGDMP" || gunzip -c "$BACKUP_FILE" 2>/dev/null | pg_restore -l >/dev/null 2>&1; then
    echo "Detected compressed PostgreSQL custom-format dump (.gz). Restoring using pg_restore..."
    USE_PG_RESTORE=true
    gunzip -c "$BACKUP_FILE" | pg_restore -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDB" --clean --if-exists --no-owner --no-privileges
  else
    echo "Detected compressed plain-text SQL (.gz). Restoring using psql..."
    gunzip -c "$BACKUP_FILE" | psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDB"
  fi
# Check if file is custom dump, tar, directory, or starts with PGDMP header
elif [ -d "$BACKUP_FILE" ] || pg_restore -l "$BACKUP_FILE" >/dev/null 2>&1 || [ "$(head -c 5 "$BACKUP_FILE" 2>/dev/null)" = "PGDMP" ] || [[ "$BACKUP_FILE" == *.dump ]] || [[ "$BACKUP_FILE" == *.backup ]] || [[ "$BACKUP_FILE" == *.tar ]]; then
  echo "Detected PostgreSQL archive/custom dump format. Restoring using pg_restore..."
  USE_PG_RESTORE=true
  pg_restore -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDB" --clean --if-exists --no-owner --no-privileges "$BACKUP_FILE"
else
  echo "Detected plain-text SQL dump. Restoring using psql..."
  psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDB" -f "$BACKUP_FILE"
fi

RESTORE_STATUS=$?

# Clear password from environment
unset PGPASSWORD

# Capture exit status
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
