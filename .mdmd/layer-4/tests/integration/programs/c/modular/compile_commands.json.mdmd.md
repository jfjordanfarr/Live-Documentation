# tests/integration/programs/c/modular/compile_commands.json

## Metadata
- Layer: 4
- Archetype: asset
- Code Path: tests/integration/programs/c/modular/compile_commands.json
- Generated At: 2026-10-16T00:58:48.764Z

## Authored
### Purpose
The compilation database scip-clang indexes the C `modular` sample from: one entry per `.c` file, compiled with `gcc -std=c11 -I src`.

### Notes
- Written by hand on 2026-10-16, with `"directory": "."` because the oracle copies the sample before indexing and rewrites the directory to the copy; `npm run oracle:index` reads it.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`logger`](./src/logger.c.mdmd.md)
- [`main`](./src/main.c.mdmd.md)
- [`metrics`](./src/metrics.c.mdmd.md)
- [`pipeline`](./src/pipeline.c.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->
