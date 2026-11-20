#!/bin/bash
# Times the gate's stages that are not the browser: one run of `npm run safe:commit` (no --e2e) as it stands, every
# line of its output stamped with the wall clock, then each stage's seconds from one `=== label ===` header to the
# next (the headers `scripts/steps.mjs` prints for every step, the nested ones of `npm run verify` among them).
# Changes nothing; run it in the browser lane from the repository's root:
#
#   node scripts/browser-lane.mjs --label <who> --max-seconds 900 -- bash <this file> <log file>
log=${1:-/tmp/gate-time.log}
start=$(date +%s.%N)
echo "$start START load $(cut -d' ' -f1-3 /proc/loadavg)" > "$log"
npm run safe:commit 2>&1 | while IFS= read -r line; do printf '%s %s\n' "$(date +%s.%N)" "$line"; done >> "$log"
status=${PIPESTATUS[0]}
echo "$(date +%s.%N) END load $(cut -d' ' -f1-3 /proc/loadavg) exit $status" >> "$log"
awk '
  NR == 1 { t0 = $1; prev = $1; label = "(start)"; next }
  / === .* ===$/ { t = $1; name = $0; sub(/^[0-9.]+ === /, "", name); sub(/ ===$/, "", name); printf "%8.1f s  %s\n", t - prev, label; label = name; prev = t; next }
  / END load / { t = $1; printf "%8.1f s  %s\n%8.1f s  whole run; %s\n", t - prev, label, t - t0, substr($0, length($1) + 2) }
' "$log"
