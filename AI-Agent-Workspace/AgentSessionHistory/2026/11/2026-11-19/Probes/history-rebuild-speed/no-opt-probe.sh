# What does it cost, and what does it give, to run without V8's optimizing compilers (Maglev and TurboFan), keeping
# the interpreter and the baseline compiler, whose frames are the interpreter's?
#   1. The parse limits again, fresh against warmed, with the compilers off: is the warmed process still deeper?
#   2. The generation of this checkout, timed four ways: as it is, with both compilers off, and with each alone off.
# Run from the checkout's root, through the lane; its output of 2026-11-20 is no-opt-probe.out beside this file.
#
# This file is the root's script of 2026-11-20 written again from the conversation on the same day, after a builder
# that shared the session's scratch folder cleared it; the paths were the scratch folder's then and are this folder's
# now, and nothing else differs. stack-share-probe.cjs hands its own node flags to the processes it starts, which this
# script relies on.
HERE="$(cd "$(dirname "$0")" && pwd)"
echo "== limits with --no-maglev --no-turbofan, $(date -u +%T)"
node --no-maglev --no-turbofan "$HERE/stack-share-probe.cjs" "$PWD/node_modules/typescript" 0.75 2>&1 | tail -16
echo "== generation as it is, $(date -u +%T)"
for flags in "" "--no-maglev --no-turbofan" "--no-turbofan" "--no-maglev"; do
  start=$(date +%s.%N)
  TSX_TSCONFIG_PATH=./tsconfig.base.json node $flags --import tsx scripts/live-docs/generate.ts > /tmp/no-opt-generate.log 2>&1; code=$?
  end=$(date +%s.%N)
  echo "generate [$flags] exit $code in $(node -e "console.log((${end}-${start}).toFixed(1))") s; $(grep 'Base layer' /tmp/no-opt-generate.log | cut -c1-120)"
done
echo "== done $(date -u +%T)"
