#!/usr/bin/env bash
# Runs the .tfignore oracle. Usage:
#   bash run.sh <workspaceRoot> [--start <dir>] [--global default|none|<file>]
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
exec java -cp "$(cat "$here/classpath.txt")" tfignoreoracle.TfIgnoreOracle "$@"
