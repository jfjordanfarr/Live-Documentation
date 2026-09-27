# tests/integration/programs/go/depot/stock/quantity_test.go

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/go/depot/stock/quantity_test.go
- Live Doc ID: LD-test-tests-integration-programs-go-depot-stock-quantity-test-go
- Generated At: 2026-09-27T20:30:56.108Z

## Authored
### Purpose
Internal tests of `Quantity` in the depot sample program, in package `stock` itself.

### Notes
- A test file in the package under test sees the package's declarations unqualified; the compiler's edge from here to `item.go` carries only the package symbol.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T20:30:56.108Z","inputHash":"cb199f4e3c35dfab"}]} -->
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

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
