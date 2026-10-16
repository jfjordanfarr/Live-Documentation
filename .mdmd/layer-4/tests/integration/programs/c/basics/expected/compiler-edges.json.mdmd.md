# tests/integration/programs/c/basics/expected/compiler-edges.json

## Metadata
- Layer: 4
- Archetype: asset
- Code Path: tests/integration/programs/c/basics/expected/compiler-edges.json
- Generated At: 2026-10-16T00:58:48.704Z

## Authored
### Purpose
The file-to-file edges the compiler resolved for the C `basics` sample, written by `npm run oracle:index` with scip-clang; the ground truth `oracle:compare` measures the adapter against.

### Notes
- Never hand-edited. Regenerate with `oracle:index` after changing the program; nothing in it is trimmed to fit the adapter. The first C expectations, written 2026-10-16 when scip-clang joined the oracle; a call resolves to its definition's file, which an include-based map cannot see, so those edges show as missing in `oracle:compare` by design.

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
- [`main`](../src/main.c.mdmd.md)
- [`util`](../src/util.c.mdmd.md)
- [`util`](../src/util.h.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->
