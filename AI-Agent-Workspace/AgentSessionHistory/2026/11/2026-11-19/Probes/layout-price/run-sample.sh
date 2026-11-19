#!/usr/bin/env bash
# The first order against eighty on every captured map of the sample not yet priced, five at a time.
# Usage: run-sample.sh <capture dir> <out dir>
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
root="$(cd "$here/../../../../../../.." && pwd)"
caps="$1"; out="$2"
cd "$root"
mkdir -p "$out"
ls "$caps"/capture-*.json | xargs -P 5 -I{} sh -c 'name=$(basename {} .json); [ -s "'"$out"'/$name.json" ] || npx tsx --tsconfig ./tsconfig.base.json "'"$here"'/first-order.ts" {} capture 80 "'"$out"'/$name.json" > "'"$out"'/$name.txt" 2>&1'
