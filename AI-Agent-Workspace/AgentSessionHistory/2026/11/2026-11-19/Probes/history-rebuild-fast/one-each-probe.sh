# What does it cost to give every change a worker of its own (each summary a fresh process's, as before 2026-11-20),
# keeping all else of the joined code: each worker writing its own tree, the pool? The same slice of the line (since
# 18:00 UTC of November 19, 210 changes on the proof branch) is rebuilt twice, each into a cache of its own key: first
# with one line of the pool changed in the working copy so that a worker is ended after every change, then with the
# line put back (workers kept from change to change). Each run's summaries are held to the old caches.
#
# This is the root's script of 2026-11-20 (run 19:19:47 to 19:49:27 UTC on 00111bf11: 17.0 minutes a worker a change,
# 9.3 minutes with workers kept, each 201 summaries identical to the old way's and none differing), written again from
# the conversation the same day after a builder that shared the session's scratch folder cleared it. It is a record of
# what was run, not a tool for today's code: since that evening the pool has the choice built in (`--keep-workers`),
# and the line it changed reads otherwise. $S was the scratch folder and $L the proof branch's checkout.
S=${S:-/tmp/one-each}
L=${L:-$PWD}
F=$L/packages/generator/src/history/regenerate.ts
P=AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/history-rebuild-fast
GOOD='      if (report.marked.length > 0 || !report.published || full) {'
ONCE='      if (true || report.marked.length > 0 || !report.published || full) {'
mkdir -p /tmp/claude-1000/oe "$S"
swap() { python3 - "$F" "$1" "$2" <<'EOF'
import sys
path, old, new = sys.argv[1:4]
text = open(path).read()
assert text.count(old) == 1, f"expected one {old!r}"
open(path, "w").write(text.replace(old, new))
EOF
}
run() {
  echo "== $1 begins $(date -u +%T), load $(cut -d' ' -f1-3 /proc/loadavg)"
  env -C $L TMPDIR=/tmp/claude-1000/oe node scripts/browser-lane.mjs --label root-probe --max-seconds 2400 -- npm run live-docs:history -- --since 2026-11-19T18:00:00Z > $S/one-each-$1.log 2>&1
  echo "== $1 exit $? at $(date -u +%T)"
  grep -v "regenerated:" $S/one-each-$1.log | grep "Wrote\|written anew\|decided\|browser-lane: released\|holds the lane" | cut -c1-330
  key=$(grep -o "under lens [0-9a-f]\{16\}" $S/one-each-$1.log | head -1 | cut -d' ' -f3)
  echo "== $1 cache $key against the old summaries:"
  node $L/$P/same-summaries-many-oracles.cjs $L/.mdmd/history/$key /workspaces/Live-Documentation/.mdmd/history/b4294caf0e7d629f /workspaces/Live-Documentation/.claude/worktrees/oracle-main/.mdmd/history/163402592515f7c7 > $S/one-each-$1-compare.log 2>&1
  echo "compare exit $?: $(tail -1 $S/one-each-$1-compare.log | cut -c1-200)"
}
swap "$GOOD" "$ONCE" || exit 1
run one-each
swap "$ONCE" "$GOOD" || { echo "THE LINE WAS NOT PUT BACK"; exit 1; }
echo "== working copy after the line is put back: $(git -C $L status --short | wc -l) files differ"
run kept
echo "== done $(date -u +%T)"
