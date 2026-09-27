# tests/integration/programs/java/warehouse/src/main/java/com/acme/warehouse/report/ReportWriter.java

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/java/warehouse/src/main/java/com/acme/warehouse/report/ReportWriter.java
- Live Doc ID: LD-test-tests-integration-programs-java-warehouse-src-main-java-com-acme-warehouse-report-reportwriter-java
- Generated At: 2026-09-27T20:19:23.911Z

## Authored
### Purpose
`ReportWriter` for the warehouse sample program: turns what an inventory holds into a `Report`.

### Notes
- Names `com.acme.warehouse.store.Inventory` fully qualified with no import, statically imports `Quantity.none`, and has a generic method with a bound (`<T extends Item>`), which is recorded as a generic-constraint type reference.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T20:19:23.911Z","inputHash":"2e2bfe99bb8d33dc"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ReportWriter` {#symbol-reportwriter}
- Type: class
- Source: [source](../../../../../../../../../../../../../../tests/integration/programs/java/warehouse/src/main/java/com/acme/warehouse/report/ReportWriter.java#L11)

##### `ReportWriter` — Summary
Turns what an inventory holds into a `Report`.

#### `write` {#symbol-write}
- Type: method
- Source: [source](../../../../../../../../../../../../../../tests/integration/programs/java/warehouse/src/main/java/com/acme/warehouse/report/ReportWriter.java#L14)
- Returns: [`Report`](./Report.java.mdmd.md#symbol-report)
- Parameters: `inventory`: [`com.acme.warehouse.store.Inventory`](../store/Inventory.java.mdmd.md#symbol-inventory)

##### `write` — Summary
A report of everything the inventory has on hand, named without an import.

#### `missing` {#symbol-missing}
- Type: method
- Source: [source](../../../../../../../../../../../../../../tests/integration/programs/java/warehouse/src/main/java/com/acme/warehouse/report/ReportWriter.java#L23)
- Returns: [`Quantity`](../model/Quantity.java.mdmd.md#symbol-quantity)

##### `missing` — Summary
The quantity of an item the inventory lacks: none, in the item's unit.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Item`](../model/Item.java.mdmd.md#symbol-item-class)
- [`Quantity`](../model/Quantity.java.mdmd.md#symbol-quantity)
- [`Report.Builder`](./Report.java.mdmd.md#symbol-builder)
- [`Report`](./Report.java.mdmd.md#symbol-report)
- [`Inventory`](../store/Inventory.java.mdmd.md#symbol-inventory)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
