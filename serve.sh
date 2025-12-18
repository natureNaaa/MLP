#!/usr/bin/env bash
set -euo pipefail
PORT=${PORT:-3000}
HOST=${HOST:-0.0.0.0}

printf 'Starting local server on http://%s:%s (Ctrl+C to stop)\n' "${HOST}" "${PORT}"
python -m http.server "${PORT}" --bind "${HOST}"
