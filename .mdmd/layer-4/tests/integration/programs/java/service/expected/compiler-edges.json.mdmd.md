# tests/integration/programs/java/service/expected/compiler-edges.json

## Metadata
- Layer: 4
- Archetype: asset
- Code Path: tests/integration/programs/java/service/expected/compiler-edges.json
- Generated At: 2026-10-02T20:20:06.459Z

## Authored
### Purpose
The file-to-file edges the compiler resolved for the `programs/java` sample program, written by `npm run oracle:index`; the ground truth `oracle:compare` measures the adapter against.

### Notes
- Never hand-edited. Regenerate with `oracle:index` after changing the program; nothing in it is trimmed to fit the adapter.

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
- [`AppService`](../src/com/example/service/AppService.java.mdmd.md)
- [`Analyzer`](../src/com/example/service/analytics/Analyzer.java.mdmd.md)
- [`Repository`](../src/com/example/service/data/Repository.java.mdmd.md)
- [`SourceRegistry`](../src/com/example/service/data/SourceRegistry.java.mdmd.md)
- [`SummaryBuilder`](../src/com/example/service/metrics/SummaryBuilder.java.mdmd.md)
- [`Sample`](../src/com/example/service/model/Sample.java.mdmd.md)
- [`Summary`](../src/com/example/service/model/Summary.java.mdmd.md)
- [`Logger`](../src/com/example/service/util/Logger.java.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->
