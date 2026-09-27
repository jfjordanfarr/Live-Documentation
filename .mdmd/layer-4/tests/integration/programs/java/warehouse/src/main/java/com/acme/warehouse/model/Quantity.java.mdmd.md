# tests/integration/programs/java/warehouse/src/main/java/com/acme/warehouse/model/Quantity.java

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/java/warehouse/src/main/java/com/acme/warehouse/model/Quantity.java
- Live Doc ID: LD-test-tests-integration-programs-java-warehouse-src-main-java-com-acme-warehouse-model-quantity-java
- Generated At: 2026-09-27T20:30:56.592Z

## Authored
### Purpose
`Quantity` for the warehouse sample program: an amount of stock in a unit, as a record with a static factory.

### Notes
- A record: its components are published as fields. Its `none` factory is the target of the static import in `report/ReportWriter.java`.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T20:30:56.592Z","inputHash":"12d2b5163b3ec9b0"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Quantity` {#symbol-quantity}
- Type: record
- Source: [source](../../../../../../../../../../../../../../tests/integration/programs/java/warehouse/src/main/java/com/acme/warehouse/model/Quantity.java#L9)

##### `Quantity` — Summary
An amount of stock in some unit.

##### `Quantity` — Parameters
- `amount`: how much
- `unit`: what the amount counts

#### `amount` {#symbol-amount}
- Type: field
- Source: [source](../../../../../../../../../../../../../../tests/integration/programs/java/warehouse/src/main/java/com/acme/warehouse/model/Quantity.java#L9)

#### `unit` {#symbol-unit}
- Type: field
- Source: [source](../../../../../../../../../../../../../../tests/integration/programs/java/warehouse/src/main/java/com/acme/warehouse/model/Quantity.java#L9)

#### `none` {#symbol-none}
- Type: method
- Source: [source](../../../../../../../../../../../../../../tests/integration/programs/java/warehouse/src/main/java/com/acme/warehouse/model/Quantity.java#L12)
- Returns: [`Quantity`](../../../../../../../../../go/depot/stock/quantity.go.mdmd.md#symbol-quantity)
- Parameters: `unit`: [`Unit`](./Unit.java.mdmd.md#symbol-unit)

##### `none` — Summary
A quantity of nothing, in the given unit.

#### `plus` {#symbol-plus}
- Type: method
- Source: [source](../../../../../../../../../../../../../../tests/integration/programs/java/warehouse/src/main/java/com/acme/warehouse/model/Quantity.java#L17)
- Returns: [`Quantity`](../../../../../../../../../go/depot/stock/quantity.go.mdmd.md#symbol-quantity)
- Parameters: `other`: [`Quantity`](../../../../../../../../../go/depot/stock/quantity.go.mdmd.md#symbol-quantity)

##### `plus` — Summary
This quantity plus another of the same unit.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Unit`](./Unit.java.mdmd.md#symbol-unit)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
