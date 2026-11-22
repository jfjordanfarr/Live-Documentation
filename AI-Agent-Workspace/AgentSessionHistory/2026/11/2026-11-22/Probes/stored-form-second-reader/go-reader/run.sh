#!/bin/sh
# Usage: sh run.sh read <file.fpk>   |   sh run.sh name <file.txt>
# Builds the Go program (standard library only) on first use or when a source changed.
dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
bin="$dir/factpack"
need=0
if [ ! -x "$bin" ]; then
  need=1
elif [ -n "$(find "$dir" -maxdepth 1 \( -name '*.go' -o -name go.mod \) -newer "$bin" 2>/dev/null)" ]; then
  need=1
fi
if [ "$need" = 1 ]; then
  GO=$(command -v go 2>/dev/null || true)
  [ -z "$GO" ] && [ -x /usr/local/go/bin/go ] && GO=/usr/local/go/bin/go
  if [ -z "$GO" ]; then echo "refused: cannot build the reader: no Go toolchain found"; exit 0; fi
  tmp="$bin.build.$$"
  if ! (cd "$dir" && GOCACHE="${GOCACHE:-$dir/.gocache}" GOTOOLCHAIN=local GOFLAGS=-mod=mod CGO_ENABLED=0 \
        "$GO" build -trimpath -o "$tmp" . ) >&2; then
    rm -f "$tmp"; echo "refused: cannot build the reader"; exit 0
  fi
  mv -f "$tmp" "$bin"
fi
exec "$bin" "$@"
