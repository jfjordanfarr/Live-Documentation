# tests/integration/programs/go/depot/report/report.go

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/go/depot/report/report.go
- Live Doc ID: LD-test-tests-integration-programs-go-depot-report-report-go
- Generated At: 2026-09-27T21:43:44.800Z

## Authored
### Purpose
`Write` and the generic `Total` for the depot sample program: renders one line per item on hand, in SKU order.

### Notes
- `Total[T stock.Number]` constrains a type parameter with another package's interface, recorded as a generic-constraint reference to `Number`.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T21:43:44.800Z","inputHash":"cbfbd2528ad425f5"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Write` {#symbol-write}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/go/depot/report/report.go#L11)
- Returns: [`Item`](./format.go.mdmd.md#symbol-item)
- Parameters: `inventory`: [`Inventory`](../store/inventory.go.mdmd.md#symbol-inventory)

##### `Write` — Summary
Write renders one line per item the inventory has on hand, in SKU order.

#### `Total` {#symbol-total}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/go/depot/report/report.go#L30)
- Constraints: [`Number`](../stock/quantity.go.mdmd.md#symbol-number)

##### `Total` — Summary
Total adds up values of any number type the stock package allows.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`format.Line`](./format.go.mdmd.md#symbol-line)
- [`format`](./format.go.mdmd.md#symbol-format)
- [`Item`](../stock/item.go.mdmd.md#symbol-item)
- [`quantity.Number`](../stock/quantity.go.mdmd.md#symbol-number)
- [`Inventory`](../store/inventory.go.mdmd.md#symbol-inventory)
<!-- LIVE-DOC:END Dependencies -->
