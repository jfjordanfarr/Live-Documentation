#!/bin/bash
# One measured run of the pool driver per line of arguments, each in a lane hold of its own so that other builders get
# their turns between them, each with a fresh scratch cache and TMPDIR, each checked against the oracle afterwards.
#
#   sweep.sh <label> <commits file> <jobs> [driver options...]
#
# Appends the driver's result line, with the label and the oracle's verdict, to $RS/sweep.jsonl.
# Run from the checkout whose build it uses; RS names the private scratch folder (default /tmp/claude-1000/rs).
set -u
RS=${RS:-/tmp/claude-1000/rs}
here=$(cd "$(dirname "$0")" && pwd)
label=$1
commits=$2
jobs=$3
shift 3
run="$RS/sw-$label"
rm -rf "$run"
mkdir -p "$run/tmp"
load=$(cut -d' ' -f1-3 /proc/loadavg)
# Inside a hold already taken (IN_LANE=1, when several runs share one hold under its cap), the lane is not asked again.
lane="node scripts/browser-lane.mjs --label rebuild-timing --max-seconds 900 --"
[ "${IN_LANE:-}" = 1 ] && lane=""
TMPDIR=${TREE_TMPDIR:-$run/tmp} $lane \
  ${PIN:-} node "$here/pool-driver.cjs" --commits "$commits" --jobs "$jobs" --cache "$run/cache" --out "$run/out" "$@" \
  > "$run/driver.log" 2>&1
line=$(grep '^{' "$run/driver.log" | tail -1)
verdict=$(node "$here/same-summaries.cjs" /workspaces/Live-Documentation/.mdmd/history/b4294caf0e7d629f "$run/cache" | tail -1)
echo "{\"label\":\"$label\",\"loadAtStart\":\"$load\",\"pin\":\"${PIN:-}\",\"oracle\":\"$verdict\",\"result\":${line:-null}}" >> "$RS/sweep.jsonl"
echo "$label: $(echo "$line" | cut -c1-400)"
echo "  $verdict"
