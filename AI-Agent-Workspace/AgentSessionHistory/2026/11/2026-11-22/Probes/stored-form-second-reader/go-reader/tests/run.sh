#!/bin/sh
# Runs every test file through ../run.sh: the samples and tests/accept must give their text
# and name; every file in tests/refuse and tests/refuse-text must be refused, with one line.
# (The refusal files are made by `go test`, see factpack_test.go.)
here=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
root=$(dirname "$here")
fail=0; n=0
tmp="$here/.out.$$"
for t in "$root"/made-empty "$root"/made-every-fact "$root"/corpus-estate "$here"/accept/many-files "$here"/accept/escapes; do
  n=$((n+1))
  sh "$root/run.sh" read "$t.fpk" > "$tmp" && cmp -s "$tmp" "$t.txt" || { echo "FAIL read $t"; fail=1; }
  got=$(sh "$root/run.sh" name "$t.txt")
  case "$got" in [0-9a-f]*) [ ${#got} -eq 64 ] || { echo "FAIL name $t: $got"; fail=1; } ;; *) echo "FAIL name $t: $got"; fail=1 ;; esac
done
check() { # mode file
  n=$((n+1))
  sh "$root/run.sh" "$1" "$2" > "$tmp" 2>/dev/null
  lines=$(wc -l < "$tmp")
  if [ "$lines" -ne 1 ] || ! head -c 9 "$tmp" | grep -q '^refused: *$\|^refused:'; then
    echo "FAIL $1 $2: $(head -c 200 "$tmp")"; fail=1
  fi
}
for f in "$here"/refuse/*.fpk; do check read "$f"; done
for f in "$here"/refuse-text/*.txt; do check name "$f"; done
# a text given to read, a binary given to name, a missing file
check read "$root/made-every-fact.txt"
check name "$root/made-every-fact.fpk"
check read "$here/no-such-file"
rm -f "$tmp"
[ $fail = 0 ] && echo "all $n checks passed"
exit $fail
