#!/usr/bin/env bash
# Creates small trees under fixtures/ that each probe one question about
# .tfignore matching. Re-runnable: removes and recreates fixtures/.
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
f="$here/fixtures"
rm -rf "$f"
mkdir -p "$f"

touchp() { for p in "$@"; do mkdir -p "$(dirname "$p")"; : > "$p"; done; }

# (a) Does a subfolder's .tfignore replace or add to its parent's?
r="$f/a-nesting"
touchp "$r/a.log" "$r/a.tmp" "$r/sub/b.log" "$r/sub/c.tmp" "$r/sub/d.cs" "$r/sub/deeper/e.log"
printf '*.log\n' > "$r/.tfignore"
printf '*.tmp\n!d.cs\n' > "$r/sub/.tfignore"
# a parent rule re-included by the child, and a child exclusion of something the parent did not exclude
touchp "$r/sub2/keep.log" "$r/sub2/x.log"
printf '!keep.log\n' > "$r/sub2/.tfignore"

# (b) Case sensitivity: name part vs path part.
r="$f/b-case"
touchp "$r/a.log" "$r/A.LoG" "$r/Docs/x.md" "$r/docs/y.md" "$r/Docs/Z.MD" "$r/BIN/q.cs" "$r/Bin/r.cs"
printf '*.LOG\nDocs\\*.md\nbin\n' > "$r/.tfignore"

# (c) Order within one file.
r="$f/c-order-exclude-then-include"
touchp "$r/keep.txt" "$r/other.txt"
printf '*.txt\n!keep.txt\n' > "$r/.tfignore"
r="$f/c-order-include-then-exclude"
touchp "$r/keep.txt" "$r/other.txt"
printf '!keep.txt\n*.txt\n' > "$r/.tfignore"

# (d) Can ! re-include a file under an excluded folder?
r="$f/d-reinclude-under-excluded-folder"
touchp "$r/out/a.dll" "$r/out/keep.dll" "$r/out/inner/keep.dll" "$r/gen/x.cs" "$r/gen/keep.cs"
printf 'out\n!out\\keep.dll\ngen\n' > "$r/.tfignore"
printf '!keep.cs\n' > "$r/gen/.tfignore"

# Re-including a folder by name does not re-include its contents (run with --global default).
r="$f/d2-reinclude-folder-name"
touchp "$r/bin/x.cs" "$r/bin/y.dll" "$r/obj/z.cs"
printf '!bin\n!obj\\*\n' > "$r/.tfignore"

# (e) Defaults with no .tfignore at all (run with --global default).
r="$f/e-defaults"
touchp "$r/a.dll" "$r/a.exe" "$r/a.class" "$r/a.user" "$r/a.cs" "$r/a.log" "$r/a.nupkg" \
       "$r/bin/x.cs" "$r/obj/y.cs" "$r/Debug/z.cs" "$r/Release/z.cs" "$r/src/bin/q.cs" \
       "$r/packages/p/lib.dll" "$r/packages/p/readme.txt" "$r/TestResults/t.xml" \
       "$r/node_modules/m/index.js" "$r/.vs/settings.json" "$r/x.cs~" "$r/x.tfOrig1" \
       "$r/.tf/baseline" "$r/sub/.tf1/baseline" "$r/.git/HEAD"

# Re-inclusion of a global default, and non-recursive re-inclusion.
r="$f/e-reinclude-default"
touchp "$r/a.dll" "$r/sub/b.dll" "$r/Help.exe" "$r/sub/Help.exe"
printf '!\\a.dll\n!\\Help.exe    \n' > "$r/.tfignore"

# Grammar.
r="$f/g-grammar"
touchp "$r/x.bak" "$r/sub/y.bak" \
       "$r/root-only.txt" "$r/sub/root-only.txt" \
       "$r/deep/slash.txt" "$r/deep/more/slash.txt" "$r/other/deep/slash.txt" \
       "$r/deep/back.txt" \
       "$r/folderonly/f.txt" "$r/sub/folderonly/g.txt" "$r/sub2/folderonly" \
       "$r/top/t.txt" "$r/sub/top/t.txt" \
       "$r/abc.dat" "$r/abbc.dat" "$r/ac.dat" \
       "$r/q.xzzy" "$r/q.xy" "$r/q.xyz" \
       "$r/name" "$r/name.txt" "$r/noext" "$r/has.ext" "$r/trail." "$r/xnoext" "$r/xhas.ext" \
       "$r/src.cpp/inner.h" "$r/main.cpp" \
       "$r/src1/a.cs" "$r/src*/a.cs" \
       "$r/my file.txt" "$r/z.log" \
       "$r/#hash.txt" "$r/sub/#hash.txt" \
       "$r/!bang.txt" \
       "$r/a/b/c.txt" "$r/a/b/d/e.txt" "$r/a/x/b/c.txt" \
       "$r/!" "$r/dup/dup.txt" "$r/Contoso/c.txt" "$r/sub/Contoso" \
       "$r/ws.txt"
{
  printf '# comment line\n'
  printf '   # indented comment\n'
  printf '\n'
  printf '\t\n'
  printf '   *.bak   \n'
  printf '\\root-only.txt\n'
  printf 'deep/slash.txt\n'
  printf 'deep\\back.txt\n'
  printf 'folderonly\\\n'
  printf '\\top/\n'
  printf 'a?c.dat\n'
  printf '*.x*y\n'
  printf 'name.\n'
  printf '*.\n'
  printf 'x*.\n'
  printf '*.cpp\n'
  printf 'src*\\a.cs\n'
  printf 'my file.txt\n'
  printf '*.log # trailing comment\n'
  printf '\\#hash.txt\n'
  printf '!!bang.txt\n'
  printf 'a\\b\\*.txt\n'
  printf '!\n'
  printf 'dup//dup.txt\n'
  printf '\\Contoso\n'
  printf '!   ws.txt   \n'
  printf 'ws.txt\n'
} > "$r/.tfignore"

# Whitespace around and after the ! and \ prefixes, and prefix order.
r="$f/g2-prefix-whitespace"
touchp "$r/ws.txt" "$r/other.txt" "$r/sub/ws.txt" "$r/top.dat" "$r/sub/top.dat" "$r/!lit.dat" "$r/sub/!lit.dat"
{
  printf '*.txt\n'
  printf '   !   \\  ws.txt   \n'
  printf '  \\  top.dat\n'
  printf '\\!lit.dat\n'
} > "$r/.tfignore"

# A pattern's folder part above the start of a walk is not checked.
r="$f/s-start-below"
touchp "$r/bin/sub/a.cs" "$r/bin/b.cs"
printf 'bin\n' > "$r/.tfignore"

# Byte-order mark and CRLF line endings.
r="$f/u-bom-crlf"
touchp "$r/a.log" "$r/b.tmp2"
printf '\xef\xbb\xbf*.log\r\n*.tmp2\r\n' > "$r/.tfignore"

echo "fixtures in $f"
