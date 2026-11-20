#!/bin/bash
# One lane hold of measurements: the walk's cost, the 60-commit sample at 14, 10 and 20 workers, and 60 consecutive
# commits at two workers for a worker's memory over thirty tasks. Each run is checked against the oracle.
set -u
cd /workspaces/Live-Documentation/.claude/worktrees/agent-ac4457f22534d6432
P=AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes
export RW=/tmp/claude-1000/rw
mkdir -p "$RW/walk/tmp"
echo "load before: $(cat /proc/loadavg)"
TMPDIR="$RW/walk/tmp" node "$P/history-rebuild-fast/walk-cost.cjs" "$RW/walk"
for jobs in ${JOBS:-14 10 20}; do
  echo "load before $jobs: $(cat /proc/loadavg)"
  bash "$P/history-rebuild-fast/worker-sweep.sh" "$PWD/$P/history-rebuild-speed/sample-60.txt" "$jobs"
done
if [ "${LONG:-1}" = 1 ]; then
  echo "load before the long run: $(cat /proc/loadavg)"
  bash "$P/history-rebuild-fast/worker-sweep.sh" "$PWD/$P/history-rebuild-fast/consecutive-60.txt" 2
fi
echo "load after: $(cat /proc/loadavg)"
