# tests/integration/programs/go/depot/stock/quantity.go

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/go/depot/stock/quantity.go
- Generated At: 2026-09-28T02:39:10.087Z

## Authored
### Purpose
`Quantity`, `Unit` and the `Number` constraint for the depot sample program, plus the unexported `format` that `item.go` uses.

### Notes
- Half of the `stock` package; the other file uses `format`, `Quantity` and `Unit` from here without qualification, which is the same-package case the adapter resolves through sibling files.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Unit (type)` {#symbol-unit-type}
- Type: type
- Source: [source](../../../../../../../../tests/integration/programs/go/depot/stock/quantity.go#L6)

##### `Unit (type)` — Summary
Unit is how a quantity is counted.

#### `Each` {#symbol-each}
- Type: constant
- Source: [source](../../../../../../../../tests/integration/programs/go/depot/stock/quantity.go#L10)

##### `Each` — Summary
Each counts whole items.

#### `Kilogram` {#symbol-kilogram}
- Type: constant
- Source: [source](../../../../../../../../tests/integration/programs/go/depot/stock/quantity.go#L12)

##### `Kilogram` — Summary
Kilogram counts by weight.

#### `Number` {#symbol-number}
- Type: interface
- Source: [source](../../../../../../../../tests/integration/programs/go/depot/stock/quantity.go#L16)

##### `Number` — Summary
Number is what a total can be made of.

#### `Quantity` {#symbol-quantity}
- Type: struct
- Source: [source](../../../../../../../../tests/integration/programs/go/depot/stock/quantity.go#L21)

##### `Quantity` — Summary
Quantity is an amount of stock in a unit.

#### `Amount` {#symbol-amount}
- Type: field
- Source: [source](../../../../../../../../tests/integration/programs/go/depot/stock/quantity.go#L22)

#### `Unit (field)` {#symbol-unit-field}
- Type: field
- Source: [source](../../../../../../../../tests/integration/programs/go/depot/stock/quantity.go#L23)

#### `Plus` {#symbol-plus}
- Type: method
- Source: [source](../../../../../../../../tests/integration/programs/go/depot/stock/quantity.go#L27)
- Returns: [`Quantity`](#symbol-quantity)
- Parameters: `other`: [`Quantity`](#symbol-quantity)

##### `Plus` — Summary
Plus adds another quantity of the same unit.

#### `format` {#symbol-format}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/go/depot/stock/quantity.go#L35)
- Parameters: `q`: [`Quantity`](#symbol-quantity)

##### `format` — Summary
format renders a quantity for a report line; item.go uses it.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
