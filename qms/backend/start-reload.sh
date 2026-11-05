#! /usr/bin/env bash
# Development entrypoint: run /app/prestart.sh, then serve the API with a single
# Uvicorn process that restarts when code under /app changes.
set -e

APP_MODULE=${APP_MODULE:-app.main:app}
HOST=${HOST:-0.0.0.0}
PORT=${PORT:-80}
LOG_LEVEL=${LOG_LEVEL:-info}

PRE_START_PATH=${PRE_START_PATH:-/app/prestart.sh}
echo "Checking for script in $PRE_START_PATH"
if [ -f "$PRE_START_PATH" ] ; then
    echo "Running script $PRE_START_PATH"
    . "$PRE_START_PATH"
else
    echo "There is no script $PRE_START_PATH"
fi

exec uvicorn --reload --host "$HOST" --port "$PORT" --log-level "$LOG_LEVEL" "$APP_MODULE"
