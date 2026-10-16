# tests/integration/programs/c/rosetta/compile_commands.json

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/c/rosetta/compile_commands.json
- Generated At: 2026-10-16T20:40:27.448Z

## Authored
### Purpose
The compilation database scip-clang indexes the C `rosetta` sample from: one entry per `.c` file, compiled with `gcc -std=c11 -I src`.

### Notes
- Written by hand on 2026-10-16, with `"directory": "."` because the oracle copies the sample before indexing and rewrites the directory to the copy; `npm run oracle:index` reads it.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`helpers`](./src/helpers.c.mdmd.md)
- [`main`](./src/main.c.mdmd.md)
- [`models`](./src/models.c.mdmd.md)
- [`processor`](./src/processor.c.mdmd.md)
- [`test_helpers`](./src/test_helpers.c.mdmd.md)
- [`test_pipeline`](./src/test_pipeline.c.mdmd.md)
- [`test_processor`](./src/test_processor.c.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->
