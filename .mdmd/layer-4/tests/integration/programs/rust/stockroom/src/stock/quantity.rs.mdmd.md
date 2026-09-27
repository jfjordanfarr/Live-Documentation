# tests/integration/programs/rust/stockroom/src/stock/quantity.rs

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/rust/stockroom/src/stock/quantity.rs
- Live Doc ID: LD-test-tests-integration-programs-rust-stockroom-src-stock-quantity-rs
- Generated At: 2026-09-27T21:43:47.965Z

## Authored
### Purpose
`Quantity` and `Unit` for the stockroom sample program, with an inline `#[cfg(test)]` module.

### Notes
- The inline test module's `use super::*` names this same file, so it is no dependency. The compiler's edge from here to `lib.rs` comes from the expansion of `format!`, which the adapter does not see.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T21:43:47.965Z","inputHash":"28506a9e3c0a9c84"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Unit (enum)` {#symbol-unit-enum}
- Type: enum
- Source: [source](../../../../../../../../../tests/integration/programs/rust/stockroom/src/stock/quantity.rs#L3)

##### `Unit (enum)` — Summary
How a quantity is counted.

#### `Each` {#symbol-each}
- Type: variant
- Source: [source](../../../../../../../../../tests/integration/programs/rust/stockroom/src/stock/quantity.rs#L4)

#### `Kilogram` {#symbol-kilogram}
- Type: variant
- Source: [source](../../../../../../../../../tests/integration/programs/rust/stockroom/src/stock/quantity.rs#L5)

#### `Quantity` {#symbol-quantity}
- Type: struct
- Source: [source](../../../../../../../../../tests/integration/programs/rust/stockroom/src/stock/quantity.rs#L10)

##### `Quantity` — Summary
An amount of stock in a unit.

#### `amount` {#symbol-amount}
- Type: field
- Source: [source](../../../../../../../../../tests/integration/programs/rust/stockroom/src/stock/quantity.rs#L11)

#### `unit (field)` {#symbol-unit-field}
- Type: field
- Source: [source](../../../../../../../../../tests/integration/programs/rust/stockroom/src/stock/quantity.rs#L12)

#### `none` {#symbol-none}
- Type: method
- Source: [source](../../../../../../../../../tests/integration/programs/rust/stockroom/src/stock/quantity.rs#L17)
- Parameters: `unit`: [`Unit`](../../../../java/warehouse/src/main/java/com/acme/warehouse/model/Unit.java.mdmd.md#symbol-unit)

##### `none` — Summary
A quantity of nothing, in the given unit.

#### `plus` {#symbol-plus}
- Type: method
- Source: [source](../../../../../../../../../tests/integration/programs/rust/stockroom/src/stock/quantity.rs#L22)
- Parameters: `other`: [`Quantity`](../../../../java/warehouse/src/main/java/com/acme/warehouse/model/Quantity.java.mdmd.md#symbol-quantity)

##### `plus` — Summary
This quantity plus another of the same unit.

#### `label` {#symbol-label}
- Type: method
- Source: [source](../../../../../../../../../tests/integration/programs/rust/stockroom/src/stock/quantity.rs#L29)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
