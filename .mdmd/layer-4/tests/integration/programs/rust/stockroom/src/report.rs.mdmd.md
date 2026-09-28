# tests/integration/programs/rust/stockroom/src/report.rs

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/rust/stockroom/src/report.rs
- Generated At: 2026-09-28T02:39:11.978Z

## Authored
### Purpose
Reports for the stockroom sample program: one line per item on hand, a generic `total` bounded by `stock::Countable`, and `count`.

### Notes
- `use crate::stock::*` is the glob import: only the names this file uses (`Countable`, `Item`, `Quantity`) link. The call `item.describe(...)` on a value of inferred type is the edge to `item.rs` the adapter cannot see.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `write` {#symbol-write}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/rust/stockroom/src/report.rs#L7)
- Parameters: `inventory`: [`Inventory`](./store/mod.rs.mdmd.md#symbol-inventory)

##### `write` — Summary
One line per item on hand, in SKU order.

#### `total` {#symbol-total}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/rust/stockroom/src/report.rs#L16)
- Constraints: [`Countable`](./stock.rs.mdmd.md#symbol-countable)

##### `total` — Summary
Adds up anything countable.

#### `count` {#symbol-count}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/rust/stockroom/src/report.rs#L21)

##### `count` — Summary
How many lines a report has.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`lib`](./lib.rs.mdmd.md)
- [`stock.Countable`](./stock.rs.mdmd.md#symbol-countable)
- [`store.Inventory`](./store/mod.rs.mdmd.md#symbol-inventory)
<!-- LIVE-DOC:END Dependencies -->
