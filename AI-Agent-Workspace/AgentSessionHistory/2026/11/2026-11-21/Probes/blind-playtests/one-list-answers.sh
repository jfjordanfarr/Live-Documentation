#!/usr/bin/env bash
# The answers of the one-list tasks (2026-11-21, `one-list-*` in scripts/playtest/tasks.json), counted by git and not by
# the trial page: a list is applied as one top-level exclude file (`--exclude-from`, read as .git/info/exclude is), names
# matched without case as on Windows. Read only on the made folder; git's own repository goes in the work folder.
#
#   bash one-list-answers.sh <folder made by make-leave-out-folder.mjs> <VisualStudio-ignore.txt> <empty work folder>
#
# The Visual Studio list is the copy in the leave-out record's `starting-lists/`.
set -u
SRC=$(cd "$1" && pwd); VS=$2; W=$3
mkdir -p "$W"
git init -q "$W/repo"
g() { git --git-dir="$W/repo/.git" --work-tree="$SRC" -c core.ignorecase=true -c core.quotePath=false "$@"; }
read_with() { g ls-files -o --exclude-from="$1" | sort > "$W/read.txt"; wc -l < "$W/read.txt"; }
g ls-files -o | sort > "$W/all.txt"
echo "files: $(wc -l < "$W/all.txt")"

# What the folders hold, from the making: bin/, obj/ and every NuGet-shaped packages folder (one holding repositories.config)
{ echo 'bin/'; echo 'obj/'; grep -E '(^|/)packages/repositories\.config$' "$W/all.txt" | sed 's|^|/|; s|repositories.config$||'; } > "$W/holds.txt"
echo "what the folders hold ($(wc -l < "$W/holds.txt") lines): read $(read_with "$W/holds.txt")"
echo "the Visual Studio list alone: read $(read_with "$VS")"
cat "$W/holds.txt" "$VS" > "$W/holds-vs.txt"
echo "what the folders hold, then the Visual Studio list: read $(read_with "$W/holds-vs.txt")"

# The folder's own ignore files: git reads the nested .gitignore files, and the .tfignore files as nested files (their
# lines here are names and *.ext only, no ! and no slash, where TFVC and git agree); a file is read when both keep it.
g ls-files -o --exclude-per-directory=.gitignore | sort > "$W/kept-gitignore.txt"
g ls-files -o --exclude-per-directory=.tfignore | sort > "$W/kept-tfignore.txt"
comm -12 "$W/kept-gitignore.txt" "$W/kept-tfignore.txt" > "$W/kept-own.txt"
echo "the folder's own ignore files: read $(wc -l < "$W/kept-own.txt")"
read_with "$W/holds.txt" > /dev/null
echo "  and what the folders hold, kept by both: read $(comm -12 "$W/kept-own.txt" "$W/read.txt" | wc -l)"
read_with "$VS" > /dev/null
echo "  and the Visual Studio list, kept by both: read $(comm -12 "$W/kept-own.txt" "$W/read.txt" | wc -l)"
printf 'bin/\nobj/\npackages/\n' > "$W/typed.txt"
echo "typed bin/, obj/, packages/: read $(read_with "$W/typed.txt")"

printf '*.png\n/DNN Platform/Tests/\n' > "$W/png-tests.txt"
echo "*.png and /DNN Platform/Tests/: read $(read_with "$W/png-tests.txt")"
{ cat "$W/holds.txt"; echo '!/DNN Platform/Library/packages/'; } > "$W/keep.txt"
echo "what the folders hold with !/DNN Platform/Library/packages/: read $(read_with "$W/keep.txt")"
grep -vx '/DNN Platform/Library/packages/' "$W/holds.txt" > "$W/keep-removed.txt"
echo "what the folders hold without its Library/packages line: read $(read_with "$W/keep-removed.txt")"

# Which line of the Visual Studio list leaves out each code file. check-ignore also reads the folder's nested .gitignore
# files, which come before the exclude file; the files they decide are given by the folder, not the line.
read_with "$VS" > /dev/null
comm -23 "$W/all.txt" "$W/read.txt" | g -c core.excludesFile="$VS" check-ignore -v --no-index --stdin |
  awk -F'\t' '{ n = split($2, p, "."); ext = tolower(p[n]); if (ext ~ /^(cs|js|ts|tsx|jsx|vb)$/) { sub(/^[^:]*:/, "", $1); print $1 "\t" ext "\t" $2 } }' |
  sed 's|/[^/]*$||' | sort | uniq -c | sort -rn
