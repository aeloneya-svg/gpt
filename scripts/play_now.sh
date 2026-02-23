#!/usr/bin/env bash
set -euo pipefail

PORT="${1:-9000}"

if ! command -v python >/dev/null 2>&1; then
  echo "python is required to run the playable demo."
  exit 1
fi

echo "Starting EchoRift Play-Now server on http://127.0.0.1:${PORT}/playable_now/index.html"
echo "Press Ctrl+C to stop."
python -m http.server "${PORT}"
