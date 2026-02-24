#!/usr/bin/env bash
set -euo pipefail

missing=0

check_cmd() {
  local name=$1
  if command -v "$name" >/dev/null 2>&1; then
    echo "[OK] $name: $(command -v "$name")"
  else
    echo "[MISSING] $name"
    missing=1
  fi
}

echo "EchoRift preflight checks"
check_cmd node
check_cmd npm
check_cmd docker
check_cmd python

if [ "$missing" -ne 0 ]; then
  echo "One or more required tools are missing."
  exit 1
fi

echo "All required tools found."
