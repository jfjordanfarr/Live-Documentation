# tests/integration/programs/java/warehouse/src/main/java/com/acme/warehouse/App.java

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/java/warehouse/src/main/java/com/acme/warehouse/App.java
- Generated At: 2026-09-27T23:21:36.668Z

## Authored
### Purpose
The entry point of the warehouse sample program: receives two items into an inventory and prints the report.

### Notes
- Names `Inventory.Listener` and `Report.Builder` through their outer types, imports the report package on demand (`.*`), and mentions `Movement` in a comment and `Report.Builder` in a string, neither of which is a reference.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `App` {#symbol-app}
- Type: class
- Source: [source](../../../../../../../../../../../../../tests/integration/programs/java/warehouse/src/main/java/com/acme/warehouse/App.java#L11)

##### `App` — Summary
Receives two items and prints the report. Mentions of Movement in this comment are not references.

#### `main` {#symbol-main}
- Type: method
- Source: [source](../../../../../../../../../../../../../tests/integration/programs/java/warehouse/src/main/java/com/acme/warehouse/App.java#L15)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Item`](./model/Item.java.mdmd.md#symbol-item-class)
- [`Quantity`](./model/Quantity.java.mdmd.md#symbol-quantity)
- [`Unit`](./model/Unit.java.mdmd.md#symbol-unit)
- [`Report`](./report/Report.java.mdmd.md#symbol-report)
- [`ReportWriter`](./report/ReportWriter.java.mdmd.md#symbol-reportwriter)
- [`Inventory`](./store/Inventory.java.mdmd.md#symbol-inventory)
- [`Inventory.Listener`](./store/Inventory.java.mdmd.md#symbol-listener)
- [`MemoryInventory`](./store/MemoryInventory.java.mdmd.md#symbol-memoryinventory)
<!-- LIVE-DOC:END Dependencies -->
