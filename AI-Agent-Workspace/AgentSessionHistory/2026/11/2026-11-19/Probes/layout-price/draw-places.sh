#!/usr/bin/env bash
# The pictures of fault 2: each of the five places at reading size, today before and after its levelling and at the end
# of each candidate's own search; pathfind.ts and the estate, today's first picture and end beside each candidate's end.
# Usage: draw-places.sh <runs dir of run-candidates.sh> <B rate> <out dir>
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
root="$(cd "$here/../../../../../../.." && pwd)"
runs="$1"; rate="$2"; out="$3"
cd "$root"
draw() { npx tsx --tsconfig ./tsconfig.base.json "$here/draw.ts" "$@"; }
# move, x, y, width, height of each place, from the outlines the move changes.
for place in "23 1650 40 1450 620" "24 0 1560 1450 620" "25 2150 6150 1450 760" "28 3250 1300 1450 1200" "29 3250 1300 1450 1200"; do
  set -- $place
  draw "$out/five-move-$1.png" "$2" "$3" "$4" "$5" \
    "today, before move $1=$runs/five-today/move-$(($1 - 1)).json" "today, after move $1=$runs/five-today/move-$1.json" \
    "A, the end of its own search=$runs/five-A/end.json" "B at $rate, the end of its own search=$runs/five-B$rate/end.json"
done
draw "$out/pathfind-levellings.png" 0 480 1720 640 \
  "today, the first picture=$runs/pathfind-today/first.json" "today, after its three levellings=$runs/pathfind-today/end.json" \
  "A, the end (all three refused)=$runs/pathfind-A/end.json" "B at $rate, the end (all three refused)=$runs/pathfind-B$rate/end.json"
draw "$out/estate-levelling.png" 0 0 1481 800 \
  "today, the first picture=$runs/estate-today/first.json" "today, after its levelling=$runs/estate-today/end.json" \
  "A, the end (the levelling taken)=$runs/estate-A/end.json" "B at $rate, the end (the levelling taken)=$runs/estate-B$rate/end.json"
