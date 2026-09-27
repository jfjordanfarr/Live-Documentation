# tests/integration/programs/go/depot/store/base.go

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/go/depot/store/base.go
- Live Doc ID: LD-test-tests-integration-programs-go-depot-store-base-go
- Generated At: 2026-09-27T20:30:56.124Z

## Authored
### Purpose
`Base` for the depot sample program: keeps listeners for an inventory to embed.

### Notes
- Embedded by `Memory` in `store/memory/memory.go`; a method promoted from here (`Listen`) is what `cmd/depot/main.go` calls without naming this file.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T20:30:56.124Z","inputHash":"3b67776194a1f586"}]} -->
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

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
