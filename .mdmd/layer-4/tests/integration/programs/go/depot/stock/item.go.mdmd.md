# tests/integration/programs/go/depot/stock/item.go

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/go/depot/stock/item.go
- Generated At: 2026-10-02T20:20:05.876Z

## Authored
### Purpose
`Item` for the depot sample program: something the depot keeps, described through the formatter in `quantity.go`.

### Notes
- Uses `format`, `Quantity` and `Unit` from its sibling file with no import, as Go allows within a package.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Item` {#symbol-item}
- Type: struct
- Source: [source](../../../../../../../../tests/integration/programs/go/depot/stock/item.go#L4)

##### `Item` — Summary
Item is something the depot keeps, identified by its SKU.

#### `SKU` {#symbol-sku}
- Type: field
- Source: [source](../../../../../../../../tests/integration/programs/go/depot/stock/item.go#L5)

#### `Name` {#symbol-name}
- Type: field
- Source: [source](../../../../../../../../tests/integration/programs/go/depot/stock/item.go#L6)

#### `Unit` {#symbol-unit}
- Type: field
- Source: [source](../../../../../../../../tests/integration/programs/go/depot/stock/item.go#L7)

#### `Describe` {#symbol-describe}
- Type: method
- Source: [source](../../../../../../../../tests/integration/programs/go/depot/stock/item.go#L11)
- Parameters: `q`: [`Quantity`](./quantity.go.mdmd.md#symbol-quantity)

##### `Describe` — Summary
Describe is the item as a report line, using the formatter from quantity.go.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Quantity`](./quantity.go.mdmd.md#symbol-quantity)
- [`quantity.Unit`](./quantity.go.mdmd.md#symbol-unit-type)
- [`quantity.format`](./quantity.go.mdmd.md#symbol-format)
<!-- LIVE-DOC:END Dependencies -->
