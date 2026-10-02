# tests/integration/programs/java/warehouse/expected/compiler-edges.json

## Metadata
- Layer: 4
- Archetype: asset
- Code Path: tests/integration/programs/java/warehouse/expected/compiler-edges.json
- Generated At: 2026-10-02T20:20:06.634Z

## Authored
### Purpose
The file-to-file edges the compiler resolved for the `java/warehouse` sample program, written by `npm run oracle:index`; the ground truth `oracle:compare` measures the adapter against.

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
- [`App`](../src/main/java/com/acme/warehouse/App.java.mdmd.md)
- [`Audited`](../src/main/java/com/acme/warehouse/model/Audited.java.mdmd.md)
- [`Item`](../src/main/java/com/acme/warehouse/model/Item.java.mdmd.md)
- [`Quantity`](../src/main/java/com/acme/warehouse/model/Quantity.java.mdmd.md)
- [`Unit`](../src/main/java/com/acme/warehouse/model/Unit.java.mdmd.md)
- [`Report`](../src/main/java/com/acme/warehouse/report/Report.java.mdmd.md)
- [`ReportWriter`](../src/main/java/com/acme/warehouse/report/ReportWriter.java.mdmd.md)
- [`Inventory`](../src/main/java/com/acme/warehouse/store/Inventory.java.mdmd.md)
- [`MemoryInventory`](../src/main/java/com/acme/warehouse/store/MemoryInventory.java.mdmd.md)
- [`ReportWriterTest`](../src/test/java/com/acme/warehouse/report/ReportWriterTest.java.mdmd.md)
- [`MemoryInventoryTest`](../src/test/java/com/acme/warehouse/store/MemoryInventoryTest.java.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->
