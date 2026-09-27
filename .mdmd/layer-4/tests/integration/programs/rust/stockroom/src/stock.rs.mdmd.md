# tests/integration/programs/rust/stockroom/src/stock.rs

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/rust/stockroom/src/stock.rs
- Live Doc ID: LD-test-tests-integration-programs-rust-stockroom-src-stock-rs
- Generated At: 2026-09-27T20:50:54.255Z

## Authored
### Purpose
The `stock` module of the stockroom sample program: declares its `item` and `quantity` submodules, re-exports their types, and defines the `Countable` trait.

### Notes
- A module file with a submodule directory (`src/stock/`), the 2018 layout; its `pub use` lines are the re-exports other files' paths are followed through.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T20:50:54.255Z","inputHash":"aa886751d62ad134"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Countable` {#symbol-countable}
- Type: trait
- Source: [source](../../../../../../../../tests/integration/programs/rust/stockroom/src/stock.rs#L10)

##### `Countable` — Summary
Anything a total can be made of.

#### `amount (method overload 1)` {#symbol-amount-method-overload-1}
- Type: method
- Source: [source](../../../../../../../../tests/integration/programs/rust/stockroom/src/stock.rs#L12)

##### `amount (method overload 1)` — Summary
The amount to add up.

#### `amount (method overload 2)` {#symbol-amount-method-overload-2}
- Type: method
- Source: [source](../../../../../../../../tests/integration/programs/rust/stockroom/src/stock.rs#L16)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Item`](./stock/item.rs.mdmd.md#symbol-item)
- [`Quantity`](./stock/quantity.rs.mdmd.md#symbol-quantity)
- [`quantity.Unit`](./stock/quantity.rs.mdmd.md#symbol-unit-enum)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
