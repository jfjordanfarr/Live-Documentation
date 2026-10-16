# tests/integration/programs/cpp/rosetta/compile_commands.json

## Metadata
- Layer: 4
- Archetype: asset
- Code Path: tests/integration/programs/cpp/rosetta/compile_commands.json
- Generated At: 2026-10-16T00:58:49.248Z

## Authored
### Purpose
The compilation database scip-clang indexes the C++ rosetta sample from: one entry per translation unit, compiled with `g++ -std=c++17 -I src`.

### Notes
- Written by hand, with `"directory": "."` because the oracle copies the sample before indexing and rewrites the directory to the copy; `npm run oracle:index -- tests/integration/programs/cpp/rosetta` reads it (2026-10-16).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`helpers`](./src/helpers.cpp.mdmd.md)
- [`main`](./src/main.cpp.mdmd.md)
- [`models`](./src/models.cpp.mdmd.md)
- [`processor`](./src/processor.cpp.mdmd.md)
- [`test_helpers`](./src/test_helpers.cpp.mdmd.md)
- [`test_pipeline`](./src/test_pipeline.cpp.mdmd.md)
- [`test_processor`](./src/test_processor.cpp.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->
