# tests/integration/programs/go/depot/stock/item_test.go

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/go/depot/stock/item_test.go
- Live Doc ID: LD-test-tests-integration-programs-go-depot-stock-item-test-go
- Generated At: 2026-09-27T21:43:44.853Z

## Authored
### Purpose
External tests of `Item` in the depot sample program, in package `stock_test`.

### Notes
- An external test package imports `stock` like any other package, so its edges go through `stock.Item` and `stock.Each` rather than bare names.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T21:43:44.853Z","inputHash":"65e0e740647200a1"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `TestDescribeStartsWithTheSKU` {#symbol-testdescribestartswiththesku}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/go/depot/stock/item_test.go#L10)
- Parameters: `t`: `T`
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Item`](./item.go.mdmd.md#symbol-item)
- [`quantity.Each`](./quantity.go.mdmd.md#symbol-each)
- [`Quantity`](./quantity.go.mdmd.md#symbol-quantity)
<!-- LIVE-DOC:END Dependencies -->
