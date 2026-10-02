# tests/integration/programs/go/depot/expected/compiler-edges.json

## Metadata
- Layer: 4
- Archetype: asset
- Code Path: tests/integration/programs/go/depot/expected/compiler-edges.json
- Generated At: 2026-10-02T20:20:05.770Z

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
- [`main`](../cmd/depot/main.go.mdmd.md)
- [`audit`](../internal/audit/audit.go.mdmd.md)
- [`count`](../report/count.go.mdmd.md)
- [`format`](../report/format.go.mdmd.md)
- [`report`](../report/report.go.mdmd.md)
- [`report_test`](../report/report_test.go.mdmd.md)
- [`item`](../stock/item.go.mdmd.md)
- [`item_test`](../stock/item_test.go.mdmd.md)
- [`quantity`](../stock/quantity.go.mdmd.md)
- [`quantity_test`](../stock/quantity_test.go.mdmd.md)
- [`base`](../store/base.go.mdmd.md)
- [`inventory`](../store/inventory.go.mdmd.md)
- [`memory`](../store/memory/memory.go.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->
