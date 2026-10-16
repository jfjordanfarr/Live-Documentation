# tests/integration/fixtures/include-dirs/expected/compiler-edges.json

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/include-dirs/expected/compiler-edges.json
- Generated At: 2026-10-16T20:40:23.287Z

## Authored
### Purpose
The compiler's resolution of every include of the include-directories fixture, written by `npm run oracle:index` with scip-clang: the ground truth the include rule is measured and tested against.

### Notes
- Never hand-edited; regenerate with `oracle:index` after changing the fixture. The edges whose symbol is the included file's own (`<file>/...`) are the include resolutions; the others are references to definitions (2026-10-16).

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
- [`engine`](../include/core/engine.hpp.mdmd.md)
- [`engine_detail`](../include/core/engine_detail.hpp.mdmd.md)
- [`main`](../src/app/main.cpp.mdmd.md)
- [`util`](../src/app/util.cpp.mdmd.md)
- [`util`](../src/app/util.hpp.mdmd.md)
- [`engine`](../src/core/engine.cpp.mdmd.md)
- [`log`](../src/shared/log.cpp.mdmd.md)
- [`log`](../src/shared/log.hpp.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->
