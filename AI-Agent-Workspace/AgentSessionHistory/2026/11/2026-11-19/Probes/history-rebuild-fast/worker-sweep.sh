#!/bin/bash
# One measured run of worker-driver.cjs per pool size given, each into a fresh scratch cache under $RW, each held to
# the oracle by same-summaries.cjs; a line of JSON per run appended to $RW/sweep.jsonl. Meant to run inside one lane
# hold, from the worktree's root after `npm run build`; safe to cut, since every run has a folder of its own and a
# line is appended only when its run and its comparison are done.
#
#   RW=/tmp/claude-1000/rw bash worker-sweep.sh <commits file> <jobs> [<jobs> ...]
set -u
here="$(cd "$(dirname "$0")" && pwd)"
oracle=/workspaces/Live-Documentation/.mdmd/history/b4294caf0e7d629f
commits="$1"
shift
for jobs in "$@"; do
  run="$RW/j$jobs-$(date +%H%M%S)"
  mkdir -p "$run/tmp"
  summary="$(TMPDIR="$run/tmp" node "$here/worker-driver.cjs" --commits "$commits" --jobs "$jobs" --cache "$run/cache" --out "$run/out" --lens-key b4294caf0e7d629f 2> "$run/progress.log")"
  node "$here/../history-rebuild-speed/same-summaries.cjs" "$oracle" "$run/cache" > "$run/oracle.log" 2>&1
  same="exit $?: $(tail -1 "$run/oracle.log")"
  echo "{\"run\":\"$run\",\"summary\":$summary,\"oracle\":\"$same\"}" >> "$RW/sweep.jsonl"
  echo "$jobs: $summary | $same"
  rm -rf "$run/tmp" "$run/cache"
done
