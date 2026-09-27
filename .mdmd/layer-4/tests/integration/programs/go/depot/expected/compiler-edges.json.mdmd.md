# tests/integration/programs/go/depot/expected/compiler-edges.json

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/go/depot/expected/compiler-edges.json
- Generated At: 2026-09-27T23:21:35.646Z

## Authored
### Purpose
The file-to-file edges the compiler resolved for the `go/depot` sample program, written by `npm run oracle:index`; the ground truth `oracle:compare` measures the adapter against.

### Notes
- Never hand-edited. Regenerate with `oracle:index` after changing the program. Six of its edges carry only the package symbol, which scip-go attributes to a package's alphabetically first file; the decisions log records why the adapter does not reproduce them.

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
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
