#!/usr/bin/env bash
set -euo pipefail

echo "Use Unity batch mode with this script in CI:"
echo "unity -quit -batchmode -projectPath client/unity_project -executeMethod EchoRift.BuildPipeline.BuildAll"
