#!/usr/bin/env bash
# The three pictures of fault 2 searched under today's price and the two candidates, side by side, each levelling's ties
# nearest the shown picture's cards and slots (the shuttle's mend as it will land), each picture of the search dumped
# for drawing: the five files at the suite's eighty orders, pathfind.ts and the estate at the visitor's defaults.
# Usage: run-candidates.sh <capture dir> <out dir> <B rate>
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
root="$(cd "$here/../../../../../../.." && pwd)"
caps="$1"; out="$2"; rate="$3"
cd "$root"
for price in today A "B:$rate"; do
  name="${price//:/}"
  npx tsx --tsconfig ./tsconfig.base.json "$here/search-moves.ts" "$caps/capture-repository-five-files.json" repository/five 80 80 joins-slots "$out/five-$name.json" 0 "$price" "$out/five-$name" > "$out/five-$name.txt" 2>&1 &
  npx tsx --tsconfig ./tsconfig.base.json "$here/search-moves.ts" "$caps/capture-pathfind.json" capture 32 8 joins-slots "$out/pathfind-$name.json" 2 "$price" "$out/pathfind-$name" > "$out/pathfind-$name.txt" 2>&1 &
  npx tsx --tsconfig ./tsconfig.base.json "$here/search-moves.ts" "$caps/capture-estate.json" capture 32 8 joins-slots "$out/estate-$name.json" 2 "$price" "$out/estate-$name" > "$out/estate-$name.txt" 2>&1 &
done
wait
