#!/usr/bin/env bash
# Builds tree-sitter-powershell.wasm, the PowerShell grammar the engine loads, from Airbus
# CERT's tree-sitter-powershell at the commit upstream.env pins, with grammar.patch applied.
#
# The patch teaches the grammar what PowerShell's argument mode reads and the upstream
# grammar does not: a comma list of bare words (`Export-ModuleMember -Function A, B`), a
# bare word that begins with a variable (`Import-Module $PSScriptRoot\x.psm1`), a native
# command's `--name=value`, `using` statements, a script that is empty or only a param
# block, and a string that begins with `<#`. Before building, the script runs the
# grammar's own corpus and this folder's test/corpus, which prove each of those; the
# build stops on any failure. The patch and its tests are what to offer upstream, and
# once upstream has them this folder can go.
#
# Needs git, node (which runs grammar.js for `tree-sitter generate`), a C compiler (cc)
# for the native parser `tree-sitter test` builds, and the tree-sitter CLI pinned in the
# root package.json, which `npm ci` installs. The CLI compiles the wasm with its own
# toolchain, wasi-sdk 34 and binaryen 132 for tree-sitter-cli 0.27.1, downloaded into
# ~/.cache/tree-sitter the first time; it needs no Emscripten. The same CLI and the same
# patch give the same bytes.
#
# Usage: packages/engine/grammars/powershell/build.sh
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
root="$(cd "$here/../../../.." && pwd)"
tree_sitter="$root/node_modules/.bin/tree-sitter"
# shellcheck source=upstream.env
source "$here/upstream.env"

if [[ ! -x "$tree_sitter" ]]; then
  echo "build.sh: $tree_sitter is missing; run npm ci at the repository root" >&2
  exit 1
fi

work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
grammar="$work/tree-sitter-powershell"

# Fetch exactly the pinned commit. autocrlf is off so that a host configured for Windows
# line endings cannot change the grammar's text, or the corpus files' expected output.
git init --quiet "$grammar"
git -C "$grammar" -c core.autocrlf=false fetch --quiet --depth 1 "$UPSTREAM_REPOSITORY" "$UPSTREAM_COMMIT"
git -C "$grammar" -c core.autocrlf=false -c advice.detachedHead=false checkout --quiet FETCH_HEAD
git -C "$grammar" apply "$here/grammar.patch"

# This folder's corpus files sit beside the grammar's own; none may replace one of them.
for corpus in "$here"/test/corpus/*.txt; do
  if [[ -e "$grammar/test/corpus/$(basename "$corpus")" ]]; then
    echo "build.sh: test/corpus/$(basename "$corpus") would replace a corpus file of the grammar's own" >&2
    exit 1
  fi
  cp "$corpus" "$grammar/test/corpus/"
done

cd "$grammar"
echo "Building with $("$tree_sitter" --version)"
"$tree_sitter" generate
"$tree_sitter" test
"$tree_sitter" build --wasm --output "$here/tree-sitter-powershell.wasm" .
cp LICENSE "$here/LICENSE"
echo "Wrote ${here#"$root"/}/tree-sitter-powershell.wasm"
