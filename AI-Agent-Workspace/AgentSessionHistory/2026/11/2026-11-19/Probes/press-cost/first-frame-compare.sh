#!/usr/bin/env bash
# The transition's first frame on two checkouts under one load: the case "the 2D and 3D presses return at once" beside
# itself at the suite's two workers, twelve times in each checkout, read from the SWITCH-PRESSES line the case prints.
# Root ran it on 2026-11-21 between main (e74d5741d) and the press's mend (eb8dac271); what it printed is in
# first-frame-compare.txt. Usage, from anywhere, the machine otherwise quiet:
#   bash first-frame-compare.sh <a folder for the logs> <name>:<checkout> <name>:<checkout>
LOGS=$1; shift
for pair in "$@"; do
  name=${pair%%:*}; dir=${pair#*:}
  echo "== $name $(git -C "$dir" rev-parse --short HEAD) at $(date -u +%T)"
  env -C "$dir" npm run build > "$LOGS/ff-$name-build.log" 2>&1; echo "build exit $?"
  env -C "$dir" npm run e2e:bundles > "$LOGS/ff-$name-bundles.log" 2>&1; echo "bundles exit $?"
  env -C "$dir" node scripts/browser-lane.mjs --label first-frame --max-seconds 600 -- node scripts/e2e-passes.mjs tests/e2e/force-graph-focus.spec.ts --grep "presses return at once" --repeat-each 12 > "$LOGS/ff-$name.log" 2>&1; echo "spec exit $? at $(date -u +%T)"
  grep -n "^  [0-9]* failed\|^  [0-9]* passed" "$LOGS/ff-$name.log" | cut -c1-80
  grep "SWITCH-PRESSES" "$LOGS/ff-$name.log" | node -e 'const rl=require("readline").createInterface({input:process.stdin});const rows=[];rl.on("line",l=>{const j=JSON.parse(l.replace(/^.*SWITCH-PRESSES /,""));rows.push([j.toMap.returned-(j.toMap.render??0),j.toMap.longestWait,j.toMap.firstFrame,j.toGraph.returned,j.toGraph.longestWait,j.toGraph.firstFrame])});rl.on("close",()=>{const names=["2D own","2D wait","2D first","3D own","3D wait","3D first"];names.forEach((n,i)=>{const v=rows.map(r=>Math.round(r[i])).sort((a,b)=>a-b);console.log(`  ${n}: ${v.join(" ")}  median ${v[Math.floor(v.length/2)]}  over 400: ${v.filter(x=>x>=400).length}`)})})'
done
echo "== done at $(date -u +%T)"
