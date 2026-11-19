#!/usr/bin/env bash
# The pictures of fault 2: each place at reading size, today before and after its levelling, then the end of each named
# candidate's own search; pathfind.ts and the estate, today's first picture and end beside each candidate's end; and the
# 7 px jog three times enlarged. Amber is ground an outline encloses over a column its directory holds no card of its own in.
# Usage: draw-places.sh <runs dir of run-candidates.sh> <out dir> <run name>=<words> ...
#   e.g. draw-places.sh runs pictures "A=A, the end of its own search" "C1=C at 1, the end of its own search"
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
root="$(cd "$here/../../../../../../.." && pwd)"
runs="$1"; out="$2"; shift 2
cd "$root"
draw() { npx tsx --tsconfig ./tsconfig.base.json "$here/draw.ts" "$@"; }
ends() { local scope="$1"; for spec in "${candidates[@]}"; do echo "${spec#*=}=$runs/$scope-${spec%%=*}/end.json"; done; }
candidates=("$@")
place() {
  local move="$1" x="$2" y="$3" w="$4" h="$5" words="$6"
  mapfile -t panels < <(ends five)
  draw "$out/five-move-$move.png" "$x" "$y" "$w" "$h" \
    "today, before $words=$runs/five-today/move-$((move - 1)).json" "today, after $words=$runs/five-today/move-$move.json" "${panels[@]}"
}
place 23 1650 40 1450 620 "levelling the top of scripts/live-docs/inspect across its two columns"
place 24 0 1560 1450 620 "levelling the tops of packages and packages/engine/src over a column with no card"
place 25 2150 6150 1450 760 "levelling the foot of packages/explorer/src/shared under a card"
place 28 3250 1300 1450 1200 "levelling the foot of scripts round an empty column"
place 29 3250 1300 1450 1200 "levelling the foot of scripts/live-docs round an empty column"
mapfile -t panels < <(ends pathfind)
draw "$out/pathfind-levellings.png" 0 480 1720 640 \
  "today, the first picture=$runs/pathfind-today/first.json" "today, after levelling the tops of packages and packages/engine/src three times=$runs/pathfind-today/end.json" "${panels[@]}"
mapfile -t panels < <(ends estate)
draw "$out/estate-levelling.png" 0 0 1481 800 \
  "today, the first picture=$runs/estate-today/first.json" "today, after levelling PaymentService/Data from an L to a rectangle=$runs/estate-today/end.json" "${panels[@]}"
