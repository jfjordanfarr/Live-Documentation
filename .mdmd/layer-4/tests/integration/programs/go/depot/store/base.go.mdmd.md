# tests/integration/programs/go/depot/store/base.go

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/go/depot/store/base.go
- Generated At: 2026-09-27T23:21:35.844Z

## Authored
### Purpose
`Base` for the depot sample program: keeps listeners for an inventory to embed.

### Notes
- Embedded by `Memory` in `store/memory/memory.go`; a method promoted from here (`Listen`) is what `cmd/depot/main.go` calls without naming this file.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Base` {#symbol-base}
- Type: struct
- Source: [source](../../../../../../../../tests/integration/programs/go/depot/store/base.go#L6)

##### `Base` — Summary
Base keeps listeners for an inventory to embed.

#### `Listen` {#symbol-listen}
- Type: method
- Source: [source](../../../../../../../../tests/integration/programs/go/depot/store/base.go#L11)
- Parameters: `listener`: [`Listener`](./inventory.go.mdmd.md#symbol-listener)

##### `Listen` — Summary
Listen registers a listener.

#### `Notify` {#symbol-notify}
- Type: method
- Source: [source](../../../../../../../../tests/integration/programs/go/depot/store/base.go#L16)
- Parameters: `item`: [`Item`](./memory/memory.go.mdmd.md#symbol-item); `delta`: [`Quantity`](../stock/quantity.go.mdmd.md#symbol-quantity)

##### `Notify` — Summary
Notify tells every listener about a movement.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Item`](../stock/item.go.mdmd.md#symbol-item)
- [`Quantity`](../stock/quantity.go.mdmd.md#symbol-quantity)
- [`inventory.Listener`](./inventory.go.mdmd.md#symbol-listener)
<!-- LIVE-DOC:END Dependencies -->
