# tests/integration/programs/java/warehouse/src/main/java/com/acme/warehouse/report/Report.java

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/java/warehouse/src/main/java/com/acme/warehouse/report/Report.java
- Generated At: 2026-09-27T23:21:36.793Z

## Authored
### Purpose
`Report` for the warehouse sample program: the lines of a stock report, built with the nested static `Builder`.

### Notes
- The nested `Builder` is what `report/ReportWriter.java` and `App.java` name as `Report.Builder`.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Report` {#symbol-report}
- Type: class
- Source: [source](../../../../../../../../../../../../../../tests/integration/programs/java/warehouse/src/main/java/com/acme/warehouse/report/Report.java#L10)

##### `Report` — Summary
A stock report: one line per `Item`, built with `Builder`.

#### `lines` {#symbol-lines}
- Type: method
- Source: [source](../../../../../../../../../../../../../../tests/integration/programs/java/warehouse/src/main/java/com/acme/warehouse/report/Report.java#L18)
- Returns: `List`

##### `lines` — Summary
The report's lines in the order they were added.

#### `Builder` {#symbol-builder}
- Type: class
- Source: [source](../../../../../../../../../../../../../../tests/integration/programs/java/warehouse/src/main/java/com/acme/warehouse/report/Report.java#L23)

##### `Builder` — Summary
Collects lines for a `Report`.

#### `add` {#symbol-add}
- Type: method
- Source: [source](../../../../../../../../../../../../../../tests/integration/programs/java/warehouse/src/main/java/com/acme/warehouse/report/Report.java#L27)
- Returns: [`Builder`](#symbol-builder)
- Parameters: `item`: [`Item`](../model/Item.java.mdmd.md#symbol-item-class); `onHand`: [`Quantity`](../model/Quantity.java.mdmd.md#symbol-quantity)

##### `add` — Summary
Adds a line for the item and how much of it is on hand.

#### `build` {#symbol-build}
- Type: method
- Source: [source](../../../../../../../../../../../../../../tests/integration/programs/java/warehouse/src/main/java/com/acme/warehouse/report/Report.java#L32)
- Returns: [`Report`](../../../../../../../../rosetta/src/com/rosetta/models/Report.java.mdmd.md#symbol-report-class)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Item`](../model/Item.java.mdmd.md#symbol-item-class)
- [`Quantity`](../model/Quantity.java.mdmd.md#symbol-quantity)
<!-- LIVE-DOC:END Dependencies -->
