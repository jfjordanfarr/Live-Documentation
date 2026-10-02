# tests/integration/programs/java/warehouse/src/main/java/com/acme/warehouse/store/MemoryInventory.java

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/java/warehouse/src/main/java/com/acme/warehouse/store/MemoryInventory.java
- Generated At: 2026-10-02T20:20:06.829Z

## Authored
### Purpose
`MemoryInventory` for the warehouse sample program: an `Inventory` kept in memory with an audit trail of `Movement`s.

### Notes
- Imports the model package on demand (`com.acme.warehouse.model.*`) and carries the workspace annotation `@Audited`; `Listener` resolves through the implemented interface's nested type.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `MemoryInventory` {#symbol-memoryinventory}
- Type: class
- Source: [source](../../../../../../../../../../../../../../tests/integration/programs/java/warehouse/src/main/java/com/acme/warehouse/store/MemoryInventory.java#L12)
- Implements: [`Inventory`](./Inventory.java.mdmd.md#symbol-inventory)

##### `MemoryInventory` — Summary
An `Inventory` kept in memory, with an audit trail of movements.

#### `Movement` {#symbol-movement}
- Type: class
- Source: [source](../../../../../../../../../../../../../../tests/integration/programs/java/warehouse/src/main/java/com/acme/warehouse/store/MemoryInventory.java#L15)

##### `Movement` — Summary
One change of stock, kept for the audit trail.

#### `item` {#symbol-item}
- Type: field
- Source: [source](../../../../../../../../../../../../../../tests/integration/programs/java/warehouse/src/main/java/com/acme/warehouse/store/MemoryInventory.java#L16)

#### `delta` {#symbol-delta}
- Type: field
- Source: [source](../../../../../../../../../../../../../../tests/integration/programs/java/warehouse/src/main/java/com/acme/warehouse/store/MemoryInventory.java#L17)

#### `receive` {#symbol-receive}
- Type: method
- Source: [source](../../../../../../../../../../../../../../tests/integration/programs/java/warehouse/src/main/java/com/acme/warehouse/store/MemoryInventory.java#L30)
- Returns: [`Quantity`](../model/Quantity.java.mdmd.md#symbol-quantity)
- Parameters: `item`: [`Item`](../model/Item.java.mdmd.md#symbol-item-class); `delta`: [`Quantity`](../model/Quantity.java.mdmd.md#symbol-quantity)

#### `onHand` {#symbol-onhand}
- Type: method
- Source: [source](../../../../../../../../../../../../../../tests/integration/programs/java/warehouse/src/main/java/com/acme/warehouse/store/MemoryInventory.java#L42)
- Returns: `Map`

#### `listen` {#symbol-listen}
- Type: method
- Source: [source](../../../../../../../../../../../../../../tests/integration/programs/java/warehouse/src/main/java/com/acme/warehouse/store/MemoryInventory.java#L47)
- Parameters: `listener`: [`Listener`](./Inventory.java.mdmd.md#symbol-listener)

#### `movements` {#symbol-movements}
- Type: method
- Source: [source](../../../../../../../../../../../../../../tests/integration/programs/java/warehouse/src/main/java/com/acme/warehouse/store/MemoryInventory.java#L52)
- Returns: `List`

##### `movements` — Summary
The movements so far, oldest first.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Audited`](../model/Audited.java.mdmd.md#symbol-audited)
- [`Item`](../model/Item.java.mdmd.md#symbol-item-class)
- [`Quantity`](../model/Quantity.java.mdmd.md#symbol-quantity)
- [`Inventory`](./Inventory.java.mdmd.md#symbol-inventory)
<!-- LIVE-DOC:END Dependencies -->
