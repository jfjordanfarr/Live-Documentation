#!/bin/sh
# Runs the fact-pack reader: sh run.sh <read|name|graph> <file>
# Builds it first (Go, standard library only) when the binary is missing
# or older than its sources.
dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd) || exit 2
bin="$dir/fpk"
stale=0
[ -x "$bin" ] || stale=1
for f in "$dir"/*.go "$dir/go.mod"; do
  [ "$f" -nt "$bin" ] && stale=1
done
if [ "$stale" = 1 ]; then
  GO=go
  command -v go >/dev/null 2>&1 || GO=/usr/local/go/bin/go
  GOCACHE="$dir/.gocache" GOMODCACHE="$dir/.gocache/mod" GOPATH="$dir/.gocache/path" \
  GOTOOLCHAIN=local GOFLAGS= CGO_ENABLED=0 GOTELEMETRY=off \
    sh -c 'cd "$1" && exec "$2" build -trimpath -o "$3" .' sh "$dir" "$GO" "$bin.tmp.$$" >&2 \
    || { rm -f "$bin.tmp.$$"; echo "run.sh: build failed" >&2; exit 2; }
  mv -f "$bin.tmp.$$" "$bin"
fi
exec "$bin" "$@"
