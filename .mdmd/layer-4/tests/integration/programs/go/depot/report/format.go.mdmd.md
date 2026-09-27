# tests/integration/programs/go/depot/report/format.go

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/go/depot/report/format.go
- Live Doc ID: LD-test-tests-integration-programs-go-depot-report-format-go
- Generated At: 2026-09-27T21:43:44.783Z

## Authored
### Purpose
`Line` and the unexported `format` for the depot sample program's reports.

### Notes
- `report.go` uses `format` from here; `count.go` has a local variable of the same name, which must not link back.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T21:43:44.783Z","inputHash":"4ac50d5ec69f489b"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Line` {#symbol-line}
- Type: struct
- Source: [source](../../../../../../../../tests/integration/programs/go/depot/report/format.go#L6)

##### `Line` — Summary
Line is one line of a report.

#### `Item` {#symbol-item}
- Type: field
- Source: [source](../../../../../../../../tests/integration/programs/go/depot/report/format.go#L7)

#### `OnHand` {#symbol-onhand}
- Type: field
- Source: [source](../../../../../../../../tests/integration/programs/go/depot/report/format.go#L8)

#### `format` {#symbol-format}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/go/depot/report/format.go#L12)
- Parameters: `line`: [`Line`](#symbol-line)

##### `format` — Summary
format renders a line; count.go has a local variable of the same name.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Item`](../stock/item.go.mdmd.md#symbol-item)
- [`Quantity`](../stock/quantity.go.mdmd.md#symbol-quantity)
<!-- LIVE-DOC:END Dependencies -->
