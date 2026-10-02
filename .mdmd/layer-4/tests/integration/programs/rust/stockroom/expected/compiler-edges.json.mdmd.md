# tests/integration/programs/rust/stockroom/expected/compiler-edges.json

## Metadata
- Layer: 4
- Archetype: asset
- Code Path: tests/integration/programs/rust/stockroom/expected/compiler-edges.json
- Generated At: 2026-10-02T20:20:08.700Z

## Authored
### Purpose
The file-to-file edges the compiler resolved for the `rust/stockroom` sample program, written by `npm run oracle:index`; the ground truth `oracle:compare` measures the adapter against.

### Notes
- Never hand-edited. Regenerate with `oracle:index` after changing the program. Its `projects` are the package's crates read from Cargo's layout, which is what narrows every `crate::` reference to the right root.

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
- [`lib`](../src/lib.rs.mdmd.md)
- [`main`](../src/main.rs.mdmd.md)
- [`report`](../src/report.rs.mdmd.md)
- [`stock`](../src/stock.rs.mdmd.md)
- [`item`](../src/stock/item.rs.mdmd.md)
- [`quantity`](../src/stock/quantity.rs.mdmd.md)
- [`memory`](../src/store/memory.rs.mdmd.md)
- [`store`](../src/store/mod.rs.mdmd.md)
- [`report`](../tests/report.rs.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->
