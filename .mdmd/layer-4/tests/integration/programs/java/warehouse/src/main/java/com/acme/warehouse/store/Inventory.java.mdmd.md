# tests/integration/programs/java/warehouse/src/main/java/com/acme/warehouse/store/Inventory.java

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/java/warehouse/src/main/java/com/acme/warehouse/store/Inventory.java
- Generated At: 2026-10-02T20:20:06.807Z

## Authored
### Purpose
`Inventory` for the warehouse sample program: the interface where stock is kept, with a nested `Listener` interface and a default method.

### Notes
- Interface members are published without modifiers because they are public by definition. Its Javadoc `@see MemoryInventory` is not a reference; the old scanner counted it as one.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Inventory` {#symbol-inventory}
- Type: interface
- Source: [source](../../../../../../../../../../../../../../tests/integration/programs/java/warehouse/src/main/java/com/acme/warehouse/store/Inventory.java#L13)

##### `Inventory` — Summary
Where stock is kept.

##### `Inventory` — Links
- `MemoryInventory`

#### `Listener` {#symbol-listener}
- Type: interface
- Source: [source](../../../../../../../../../../../../../../tests/integration/programs/java/warehouse/src/main/java/com/acme/warehouse/store/Inventory.java#L16)

##### `Listener` — Summary
Told about every movement of stock.

#### `moved` {#symbol-moved}
- Type: method
- Source: [source](../../../../../../../../../../../../../../tests/integration/programs/java/warehouse/src/main/java/com/acme/warehouse/store/Inventory.java#L17)
- Parameters: `item`: [`Item`](../model/Item.java.mdmd.md#symbol-item-class); `delta`: [`Quantity`](../model/Quantity.java.mdmd.md#symbol-quantity)

#### `receive` {#symbol-receive}
- Type: method
- Source: [source](../../../../../../../../../../../../../../tests/integration/programs/java/warehouse/src/main/java/com/acme/warehouse/store/Inventory.java#L28)
- Returns: [`Quantity`](../model/Quantity.java.mdmd.md#symbol-quantity)
- Parameters: `item`: [`Item`](../model/Item.java.mdmd.md#symbol-item-class); `delta`: [`Quantity`](../model/Quantity.java.mdmd.md#symbol-quantity)

##### `receive` — Summary
Adds stock of an item.

##### `receive` — Parameters
- `item`: the item received
- `delta`: how much arrived

##### `receive` — Returns
the quantity on hand afterwards

##### `receive` — Exceptions
- `IllegalArgumentException`: if the delta's unit is not the item's

#### `onHand` {#symbol-onhand}
- Type: method
- Source: [source](../../../../../../../../../../../../../../tests/integration/programs/java/warehouse/src/main/java/com/acme/warehouse/store/Inventory.java#L31)
- Returns: `Map`

##### `onHand` — Summary
Everything on hand, by item.

#### `listen` {#symbol-listen}
- Type: method
- Source: [source](../../../../../../../../../../../../../../tests/integration/programs/java/warehouse/src/main/java/com/acme/warehouse/store/Inventory.java#L34)
- Parameters: `listener`: [`Listener`](#symbol-listener)

##### `listen` — Summary
Registers a listener; the default keeps none.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Item`](../model/Item.java.mdmd.md#symbol-item-class)
- [`Quantity`](../model/Quantity.java.mdmd.md#symbol-quantity)
<!-- LIVE-DOC:END Dependencies -->
