#!/usr/bin/env bash
# Runs the oracle over every fixture and writes results/<fixture>.tsv.
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$here/results"
for d in "$here"/fixtures/*/; do
  name="$(basename "$d")"
  case "$name" in
    e-*|d2-*) global=default ;;
    *) global=none ;;
  esac
  extra=()
  if [ "$name" = "s-start-below" ]; then extra=(--start "$d/bin"); fi
  bash "$here/run.sh" "$d" --global "$global" "${extra[@]}" > "$here/results/$name.tsv"
  echo "$name (--global $global ${extra[*]:-}) -> results/$name.tsv"
done
