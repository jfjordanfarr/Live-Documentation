#!/usr/bin/env bash
# The landing's stages on the day branch, one after another, each with its start, its end and its exit; stops at the
# first that fails, and the script's own exit is that stage's number (0 only when all four passed). Run it as the whole
# command, with nothing after it, so that the task's exit is this script's.
cd /workspaces/Live-Documentation || exit 90
LOG="$1"
stage() {
  local name="$1"; shift
  echo "=== $name: begun $(date -u +%H:%M:%S) UTC, HEAD $(git rev-parse --short=9 HEAD), load $(cut -d' ' -f1 /proc/loadavg)" >> "$LOG"
  "$@" > "$LOG.$name.out" 2>&1
  local code=$?
  echo "=== $name: ended $(date -u +%H:%M:%S) UTC, exit $code" >> "$LOG"
  return $code
}
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then echo "=== not begun: the working tree holds uncommitted changes" >> "$LOG"; exit 9; fi
stage history npm run -s live-docs:history -- --remove-superseded --check-head || exit 1
stage gate npm run -s safe:commit || exit 2
stage bundles npm run -s e2e:bundles || exit 3
stage browser node scripts/browser-lane.mjs --label gate --max-seconds 5400 -- node scripts/e2e-passes.mjs || exit 4
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then echo "=== the stages passed but left the working tree changed" >> "$LOG"; exit 8; fi
echo "=== all stages passed at $(date -u +%H:%M:%S) UTC, HEAD $(git rev-parse --short=9 HEAD)" >> "$LOG"
