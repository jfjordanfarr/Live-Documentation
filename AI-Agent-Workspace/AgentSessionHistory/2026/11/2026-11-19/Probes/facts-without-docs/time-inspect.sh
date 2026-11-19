#!/usr/bin/env bash
# Probe of November 19, 2026: how long `inspect` takes to answer one question, deriving the graph from the docs as it
# does today, beside the command's start-up alone (`--version`). Run from the worktree root after probe.cjs's "full"
# mode has written the docs. Usage: time-inspect.sh <workspace> <file>
set -euo pipefail
workspace="$1"
file="$2"
TIMEFORMAT='%R'
run() { { time npx tsx --tsconfig ./tsconfig.base.json scripts/live-docs/inspect.ts "$@" > /dev/null 2>&1; } 2>&1; }
for i in 1 2; do
  echo "version $(run --version)"
  echo "from $(run --workspace "$workspace" --from "$file")"
done
