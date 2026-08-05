#!/bin/sh
set -eu

DATABASE_URL="$(node /app/docker/normalize-database-url.mjs DATABASE_URL)"
export DATABASE_URL

if [ -n "${DIRECT_URL:-}" ]; then
  DIRECT_URL="$(node /app/docker/normalize-database-url.mjs DIRECT_URL)"
  export DIRECT_URL
fi

exec "$@"
