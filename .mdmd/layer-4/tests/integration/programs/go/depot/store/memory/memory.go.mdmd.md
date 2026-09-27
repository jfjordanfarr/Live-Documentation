# tests/integration/programs/go/depot/store/memory/memory.go

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/go/depot/store/memory/memory.go
- Live Doc ID: LD-test-tests-integration-programs-go-depot-store-memory-memory-go
- Generated At: 2026-09-27T21:43:44.945Z

## Authored
### Purpose
`Memory` for the depot sample program: an inventory kept in memory, in a package named `memstore` inside a directory named `memory`.

### Notes
- The package name differs from the directory name, so an importer refers to it as `memstore` unless it aliases the import; the adapter takes the name from the package clause. Embeds `store.Base`, which is recorded as an extends reference.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T21:43:44.945Z","inputHash":"8cbd2baaa9d0e011"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Memory` {#symbol-memory}
- Type: struct
- Source: [source](../../../../../../../../../tests/integration/programs/go/depot/store/memory/memory.go#L10)
- Extends: [`Base`](../base.go.mdmd.md#symbol-base)

##### `Memory` — Summary
Memory is a store.Inventory that forgets everything when the process ends.

#### `New` {#symbol-new}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/programs/go/depot/store/memory/memory.go#L17)
- Returns: [`Memory`](../../../../rust/stockroom/src/store/memory.rs.mdmd.md#symbol-memory)

##### `New` — Summary
New makes an empty inventory.

#### `Receive` {#symbol-receive}
- Type: method
- Source: [source](../../../../../../../../../tests/integration/programs/go/depot/store/memory/memory.go#L22)
- Returns: [`Quantity`](../../stock/quantity.go.mdmd.md#symbol-quantity)
- Parameters: `item`: [`Item`](../../report/format.go.mdmd.md#symbol-item); `delta`: [`Quantity`](../../stock/quantity.go.mdmd.md#symbol-quantity)

##### `Receive` — Summary
Receive adds stock of an item.

#### `OnHand` {#symbol-onhand}
- Type: method
- Source: [source](../../../../../../../../../tests/integration/programs/go/depot/store/memory/memory.go#L38)
- Returns: [`Quantity`](../../stock/quantity.go.mdmd.md#symbol-quantity)

##### `OnHand` — Summary
OnHand is everything on hand, by SKU.

#### `Item` {#symbol-item}
- Type: method
- Source: [source](../../../../../../../../../tests/integration/programs/go/depot/store/memory/memory.go#L47)
- Returns: [`Item`](../../report/format.go.mdmd.md#symbol-item)

##### `Item` — Summary
Item is the item behind a SKU, if the inventory has seen it.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Item`](../../stock/item.go.mdmd.md#symbol-item)
- [`Quantity`](../../stock/quantity.go.mdmd.md#symbol-quantity)
- [`Base`](../base.go.mdmd.md#symbol-base)
- [`Inventory`](../inventory.go.mdmd.md#symbol-inventory)
<!-- LIVE-DOC:END Dependencies -->
