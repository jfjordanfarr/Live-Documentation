# tests/integration/programs/go/depot/stock/quantity_test.go

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/go/depot/stock/quantity_test.go
- Generated At: 2026-09-27T23:21:35.826Z

## Authored
### Purpose
Internal tests of `Quantity` in the depot sample program, in package `stock` itself.

### Notes
- A test file in the package under test sees the package's declarations unqualified; the compiler's edge from here to `item.go` carries only the package symbol.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `TestPlusKeepsTheUnit` {#symbol-testpluskeepstheunit}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/go/depot/stock/quantity_test.go#L5)
- Parameters: `t`: `T`

#### `TestPlusRejectsMixedUnits` {#symbol-testplusrejectsmixedunits}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/go/depot/stock/quantity_test.go#L12)
- Parameters: `t`: `T`
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`quantity.Each`](./quantity.go.mdmd.md#symbol-each)
- [`quantity.Kilogram`](./quantity.go.mdmd.md#symbol-kilogram)
- [`Quantity`](./quantity.go.mdmd.md#symbol-quantity)
<!-- LIVE-DOC:END Dependencies -->
