#!/usr/bin/env bash
# The three pictures of fault 2 searched under today's price and candidate prices, side by side, each levelling's ties
# nearest the shown picture's cards and slots (the shuttle's mend as it will land), each picture of the search dumped
# for drawing: the five files at the suite's eighty orders, pathfind.ts and the estate at the visitor's defaults. Then A
# searched again on the five files with today's moves 26 and 27 offered to its end picture.
# Usage: run-candidates.sh <capture dir> <out dir> <price> ...   (today first among the prices, A last, as in the third
# leg: run-candidates.sh caps out today C:1 Cveto:1 C:0.5 A)
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
root="$(cd "$here/../../../../../../.." && pwd)"
caps="$1"; out="$2"; shift 2
cd "$root"
search() { npx tsx --tsconfig ./tsconfig.base.json "$here/search-moves.ts" "$@"; }
for price in "$@"; do
  [ "$price" = A ] && continue
  name="${price//:/}"
  search "$caps/capture-repository-five-files.json" repository/five 80 80 joins-slots "$out/five-$name.json" 0 "$price" "$out/five-$name" > "$out/five-$name.txt" 2>&1 &
  search "$caps/capture-pathfind.json" capture 32 8 joins-slots "$out/pathfind-$name.json" 2 "$price" "$out/pathfind-$name" > "$out/pathfind-$name.txt" 2>&1 &
  search "$caps/capture-estate.json" capture 32 8 joins-slots "$out/estate-$name.json" 2 "$price" "$out/estate-$name" > "$out/estate-$name.txt" 2>&1 &
done
wait
for price in "$@"; do
  [ "$price" = A ] || continue
  OFFER_FROM="$out/five-today.json" OFFER_MOVES=22,26,27 search "$caps/capture-repository-five-files.json" repository/five 80 80 joins-slots "$out/five-A.json" 0 A "$out/five-A" > "$out/five-A.txt" 2>&1 &
  search "$caps/capture-pathfind.json" capture 32 8 joins-slots "$out/pathfind-A.json" 2 A "$out/pathfind-A" > "$out/pathfind-A.txt" 2>&1 &
  search "$caps/capture-estate.json" capture 32 8 joins-slots "$out/estate-A.json" 2 A "$out/estate-A" > "$out/estate-A.txt" 2>&1 &
done
wait
