# tests/integration/programs/rust/stockroom/src/store/mod.rs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/rust/stockroom/src/store/mod.rs
- Generated At: 2026-10-02T20:20:08.821Z

## Authored
### Purpose
The `store` module of the stockroom sample program, as a `mod.rs` directory module: the `Inventory` trait and the `Listener` type.

### Notes
- Labelled `store` in Dependencies lists, the way a Python package's `__init__.py` is labelled by its package.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `memory` {#symbol-memory}
- Type: module
- Source: [source](../../../../../../../../../tests/integration/programs/rust/stockroom/src/store/mod.rs#L3)

#### `Inventory` {#symbol-inventory}
- Type: trait
- Source: [source](../../../../../../../../../tests/integration/programs/rust/stockroom/src/store/mod.rs#L8)

##### `Inventory` — Summary
Where stock is kept.

#### `receive` {#symbol-receive}
- Type: method
- Source: [source](../../../../../../../../../tests/integration/programs/rust/stockroom/src/store/mod.rs#L10)
- Parameters: `item`: [`Item`](../stock/item.rs.mdmd.md#symbol-item); `delta`: [`Quantity`](../stock/quantity.rs.mdmd.md#symbol-quantity)

##### `receive` — Summary
Adds stock of an item and returns what is on hand afterwards.

#### `on_hand` {#symbol-on_hand}
- Type: method
- Source: [source](../../../../../../../../../tests/integration/programs/rust/stockroom/src/store/mod.rs#L12)

##### `on_hand` — Summary
Everything on hand, by SKU.

#### `Listener` {#symbol-listener}
- Type: type
- Source: [source](../../../../../../../../../tests/integration/programs/rust/stockroom/src/store/mod.rs#L16)

##### `Listener` — Summary
Told about every movement of stock.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`lib`](../lib.rs.mdmd.md)
- [`stock`](../stock.rs.mdmd.md)
- [`Item`](../stock/item.rs.mdmd.md#symbol-item)
- [`Quantity`](../stock/quantity.rs.mdmd.md#symbol-quantity)
- [`memory`](./memory.rs.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->
