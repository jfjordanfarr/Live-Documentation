# tests/integration/programs/go/depot/store/inventory.go

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/go/depot/store/inventory.go
- Generated At: 2026-10-02T20:20:05.953Z

## Authored
### Purpose
`Inventory` and `Listener` for the depot sample program: the interface where stock is kept and the callback told about movements.

### Notes
- The interface's methods are published under `Inventory.Receive` and `Inventory.OnHand`; `store/memory/memory.go` implements them.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Inventory` {#symbol-inventory}
- Type: interface
- Source: [source](../../../../../../../../tests/integration/programs/go/depot/store/inventory.go#L6)

##### `Inventory` — Summary
Inventory is where stock is kept.

#### `Receive` {#symbol-receive}
- Type: method
- Source: [source](../../../../../../../../tests/integration/programs/go/depot/store/inventory.go#L8)
- Returns: [`Quantity`](../stock/quantity.go.mdmd.md#symbol-quantity)
- Parameters: `item`: [`Item`](./memory/memory.go.mdmd.md#symbol-item); `delta`: [`Quantity`](../stock/quantity.go.mdmd.md#symbol-quantity)

##### `Receive` — Summary
Receive adds stock of an item and returns what is on hand afterwards.

#### `OnHand` {#symbol-onhand}
- Type: method
- Source: [source](../../../../../../../../tests/integration/programs/go/depot/store/inventory.go#L10)
- Returns: [`Quantity`](../stock/quantity.go.mdmd.md#symbol-quantity)

##### `OnHand` — Summary
OnHand is everything on hand, by SKU.

#### `Listener` {#symbol-listener}
- Type: type
- Source: [source](../../../../../../../../tests/integration/programs/go/depot/store/inventory.go#L14)
- Parameters: `item`: [`Item`](./memory/memory.go.mdmd.md#symbol-item); `delta`: [`Quantity`](../stock/quantity.go.mdmd.md#symbol-quantity)

##### `Listener` — Summary
Listener is told about every movement of stock.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Item`](../stock/item.go.mdmd.md#symbol-item)
- [`Quantity`](../stock/quantity.go.mdmd.md#symbol-quantity)
<!-- LIVE-DOC:END Dependencies -->
