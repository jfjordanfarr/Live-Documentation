# tests/integration/programs/rust/stockroom/src/store/memory.rs

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/rust/stockroom/src/store/memory.rs
- Live Doc ID: LD-test-tests-integration-programs-rust-stockroom-src-store-memory-rs
- Generated At: 2026-09-27T20:50:54.294Z

## Authored
### Purpose
`Memory` for the stockroom sample program: an inventory kept in memory that implements `store::Inventory`.

### Notes
- Uses `super::` for the parent module's trait and `crate::` for the stock types; the trait implementation is recorded as an implements reference on `Memory`.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T20:50:54.294Z","inputHash":"c03f0b12cfd06a25"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Memory` {#symbol-memory}
- Type: struct
- Source: [source](../../../../../../../../../tests/integration/programs/rust/stockroom/src/store/memory.rs#L8)
- Implements: [`Inventory`](../../../../java/warehouse/src/main/java/com/acme/warehouse/store/Inventory.java.mdmd.md#symbol-inventory)

##### `Memory` — Summary
An inventory kept in memory, with listeners.

#### `new` {#symbol-new}
- Type: method
- Source: [source](../../../../../../../../../tests/integration/programs/rust/stockroom/src/store/memory.rs#L15)

##### `new` — Summary
An empty inventory.

#### `listen` {#symbol-listen}
- Type: method
- Source: [source](../../../../../../../../../tests/integration/programs/rust/stockroom/src/store/memory.rs#L20)
- Parameters: `listener`: [`Listener`](../../../../java/warehouse/src/main/java/com/acme/warehouse/store/Inventory.java.mdmd.md#symbol-listener)

##### `listen` — Summary
Registers a listener.

#### `receive` {#symbol-receive}
- Type: method
- Source: [source](../../../../../../../../../tests/integration/programs/rust/stockroom/src/store/memory.rs#L26)
- Parameters: `item`: [`Item`](../stock/item.rs.mdmd.md#symbol-item); `delta`: [`Quantity`](../stock/quantity.rs.mdmd.md#symbol-quantity)

#### `on_hand` {#symbol-on_hand}
- Type: method
- Source: [source](../../../../../../../../../tests/integration/programs/rust/stockroom/src/store/memory.rs#L36)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`lib`](../lib.rs.mdmd.md)
- [`stock`](../stock.rs.mdmd.md)
- [`Item`](../stock/item.rs.mdmd.md#symbol-item)
- [`Quantity`](../stock/quantity.rs.mdmd.md#symbol-quantity)
- [`store.Inventory`](./mod.rs.mdmd.md#symbol-inventory)
- [`store.Listener`](./mod.rs.mdmd.md#symbol-listener)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
