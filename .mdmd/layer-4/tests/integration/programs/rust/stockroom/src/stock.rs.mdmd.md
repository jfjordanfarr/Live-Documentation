# tests/integration/programs/rust/stockroom/src/stock.rs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/rust/stockroom/src/stock.rs
- Generated At: 2026-10-02T20:20:08.755Z

## Authored
### Purpose
The `stock` module of the stockroom sample program: declares its `item` and `quantity` submodules, re-exports their types, and defines the `Countable` trait.

### Notes
- A module file with a submodule directory (`src/stock/`), the 2018 layout; its `pub use` lines are the re-exports other files' paths are followed through.

## Generated
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
