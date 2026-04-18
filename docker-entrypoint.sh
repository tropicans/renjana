#!/bin/sh
set -eu

set +e
MIGRATE_OUTPUT=$(node node_modules/prisma/build/index.js migrate deploy --schema=./prisma/schema.prisma 2>&1)
MIGRATE_STATUS=$?
set -e

if [ "$MIGRATE_STATUS" -ne 0 ]; then
  printf '%s\n' "$MIGRATE_OUTPUT"

  case "$MIGRATE_OUTPUT" in
    *"Error: P3005"*)
      printf '%s\n' "Skipping automatic migration because this database needs a one-time Prisma baseline."
      ;;
    *)
      exit "$MIGRATE_STATUS"
      ;;
  esac
else
  printf '%s\n' "$MIGRATE_OUTPUT"
fi

exec node server.js
