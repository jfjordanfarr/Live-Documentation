#!/bin/sh
# Runs every case in tests/expected.tsv through run.sh and checks that each
# is refused, with one line beginning "refused:" that holds the expected words.
# Then checks the three samples and the valid test files.
cd "$(dirname "$0")/.." || exit 2
pass=0; fail=0
tab=$(printf '\t')
while IFS="$tab" read -r mode file why; do
  out=$(sh run.sh "$mode" "$file")
  lines=$(printf '%s\n' "$out" | wc -l)
  case "$out" in
    refused:*"$why"*) if [ "$lines" -eq 1 ]; then pass=$((pass+1)); else fail=$((fail+1)); echo "FAIL (lines) $file: $out"; fi ;;
    *) fail=$((fail+1)); echo "FAIL $mode $file: want '$why', got: $(printf '%s' "$out" | head -c 300)" ;;
  esac
done < tests/expected.tsv
for b in made-empty made-every-fact made-seeded-5-30; do
  if sh run.sh read "$b.fpk" | cmp -s - "$b.txt"; then pass=$((pass+1)); else fail=$((fail+1)); echo "FAIL read $b"; fi
  n=$(sh run.sh name "$b.txt")
  e=$(python3 -I tools/fpkname.py "$b.fpk" | cut -d' ' -f1)
  if [ "$n" = "$e" ]; then pass=$((pass+1)); else fail=$((fail+1)); echo "FAIL name $b: $n vs $e"; fi
  if sh run.sh graph "$b.fpk" | python3 -I -c 'import json,sys; json.load(sys.stdin)'; then pass=$((pass+1)); else fail=$((fail+1)); echo "FAIL graph $b"; fi
done
for f in tests/good-two-files.fpk tests/valid-past-text-bound.fpk; do
  if sh run.sh graph "$f" | python3 -I -c 'import json,sys; json.load(sys.stdin)'; then pass=$((pass+1)); else fail=$((fail+1)); echo "FAIL graph $f"; fi
done
echo "passed $pass, failed $fail"
[ "$fail" -eq 0 ]
