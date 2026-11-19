#!/usr/bin/env bash
# The five-file search replayed in parallel, each of three ways (free, as the page runs it today; anchored, every trial's
# ties nearest the shown picture; joins, the levellings' alone), at the visitor's defaults (two starts before paint,
# 32 orders, patience 8) and at the browser suite's eighty-order setting (no start before paint, 80 orders, patience 80).
# Usage: run-searches.sh <capture.json> <out dir>
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
root="$(cd "$here/../../../../../../.." && pwd)"
capture="$1"; out="$2"
cd "$root"
for setting in "32 8 2" "80 80 0"; do
  for mode in free anchored joins; do
    set -- $setting
    npx tsx --tsconfig ./tsconfig.base.json "$here/search-moves.ts" "$capture" repository/five "$1" "$2" "$mode" "$out/five-$1-$mode.json" "$3" > "$out/five-$1-$mode.txt" 2>&1 &
  done
done
wait
