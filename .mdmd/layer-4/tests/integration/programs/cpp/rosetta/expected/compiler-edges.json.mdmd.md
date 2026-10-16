# tests/integration/programs/cpp/rosetta/expected/compiler-edges.json

## Metadata
- Layer: 4
- Archetype: asset
- Code Path: tests/integration/programs/cpp/rosetta/expected/compiler-edges.json
- Generated At: 2026-10-16T00:58:49.265Z

## Authored
### Purpose
The file-to-file edges the compiler resolved for the C++ rosetta sample, written by `npm run oracle:index` with scip-clang; the ground truth `oracle:compare` measures the adapter against.

### Notes
- Never hand-edited. Regenerate with `oracle:index` after changing the program; nothing in it is trimmed to fit the adapter. A reference to a function resolves to its definition's file, so the compiler sees `main.cpp` depend on `models.cpp` where the docs see the include of `models.hpp`; the include edges are the ones whose symbol is the included file's own (2026-10-16).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `tool` {#symbol-tool}
- Type: key

#### `projectFile` {#symbol-projectfile}
- Type: key

#### `projects` {#symbol-projects}
- Type: key

#### `documents` {#symbol-documents}
- Type: key

#### `outside` {#symbol-outside}
- Type: key

#### `edges` {#symbol-edges}
- Type: key

#### `ambiguous` {#symbol-ambiguous}
- Type: key
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`compile_commands`](../compile_commands.json.mdmd.md)
- [`helpers`](../src/helpers.cpp.mdmd.md)
- [`helpers`](../src/helpers.hpp.mdmd.md)
- [`main`](../src/main.cpp.mdmd.md)
- [`models`](../src/models.cpp.mdmd.md)
- [`models`](../src/models.hpp.mdmd.md)
- [`processor`](../src/processor.cpp.mdmd.md)
- [`processor`](../src/processor.hpp.mdmd.md)
- [`test_helpers`](../src/test_helpers.cpp.mdmd.md)
- [`test_pipeline`](../src/test_pipeline.cpp.mdmd.md)
- [`test_processor`](../src/test_processor.cpp.mdmd.md)
- [`types`](../src/types.hpp.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->
