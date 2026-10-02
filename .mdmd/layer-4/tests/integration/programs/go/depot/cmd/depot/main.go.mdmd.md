# tests/integration/programs/go/depot/cmd/depot/main.go

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/go/depot/cmd/depot/main.go
- Generated At: 2026-10-02T20:20:05.751Z

## Authored
### Purpose
The command of the depot sample program: receives two items into an in-memory inventory and prints the report.

### Notes
- Imports the audit package blank for its `init`, aliases the memory store as `memstore`, and mentions `store.Inventory`, `audit.Log` and `stock.Item` in a comment and a string, none of which is a reference. Its call to `Listen`, a method promoted from the embedded `store.Base`, is the one edge here that needs type inference.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `main` {#symbol-main}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/programs/go/depot/cmd/depot/main.go#L13)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`audit`](../../internal/audit/audit.go.mdmd.md)
- [`Count`](../../report/count.go.mdmd.md#symbol-count)
- [`report.Write`](../../report/report.go.mdmd.md#symbol-write)
- [`Item`](../../stock/item.go.mdmd.md#symbol-item)
- [`quantity.Each`](../../stock/quantity.go.mdmd.md#symbol-each)
- [`quantity.Kilogram`](../../stock/quantity.go.mdmd.md#symbol-kilogram)
- [`Quantity`](../../stock/quantity.go.mdmd.md#symbol-quantity)
- [`memory.New`](../../store/memory/memory.go.mdmd.md#symbol-new)
<!-- LIVE-DOC:END Dependencies -->
