#!/usr/bin/env bash
set -euo pipefail

BASE_URL=${BASE_URL:-http://localhost:8080}

curl -sS "$BASE_URL/health"
curl -sS -X POST "$BASE_URL/auth/login" -H 'content-type: application/json' -d '{"username":"smokeuser","isMinor":false}'
curl -sS "$BASE_URL/analytics/summary"
