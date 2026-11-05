#! /usr/bin/env bash
# Production entrypoint: run /app/prestart.sh (wait for the DB, migrate, seed
# the first superuser), then serve the API with Uvicorn worker processes.
set -e

APP_MODULE=${APP_MODULE:-app.main:app}
HOST=${HOST:-0.0.0.0}
PORT=${PORT:-80}
LOG_LEVEL=${LOG_LEVEL:-info}
# One worker per CPU core, at least two, unless WEB_CONCURRENCY says otherwise
CORES=$(nproc)
WEB_CONCURRENCY=${WEB_CONCURRENCY:-$(( CORES > 2 ? CORES : 2 ))}

PRE_START_PATH=${PRE_START_PATH:-/app/prestart.sh}
echo "Checking for script in $PRE_START_PATH"
if [ -f "$PRE_START_PATH" ] ; then
    echo "Running script $PRE_START_PATH"
    . "$PRE_START_PATH"
else
    echo "There is no script $PRE_START_PATH"
fi

exec uvicorn --host "$HOST" --port "$PORT" --log-level "$LOG_LEVEL" \
    --workers "$WEB_CONCURRENCY" "$APP_MODULE"
