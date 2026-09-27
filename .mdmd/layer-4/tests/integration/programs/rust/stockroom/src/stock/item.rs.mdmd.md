# tests/integration/programs/rust/stockroom/src/stock/item.rs

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/rust/stockroom/src/stock/item.rs
- Live Doc ID: LD-test-tests-integration-programs-rust-stockroom-src-stock-item-rs
- Generated At: 2026-09-27T21:43:47.947Z

## Authored
### Purpose
`Item` for the stockroom sample program: something the stockroom keeps, identified by its SKU.

### Notes
- Reaches `Quantity` through `super::quantity`, a sibling module named through the parent.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T21:43:47.947Z","inputHash":"aab9bea3b03e5190"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Item` {#symbol-item}
- Type: struct
- Source: [source](../../../../../../../../../tests/integration/programs/rust/stockroom/src/stock/item.rs#L5)

##### `Item` — Summary
Something the stockroom keeps, identified by its SKU.

#### `sku` {#symbol-sku}
- Type: field
- Source: [source](../../../../../../../../../tests/integration/programs/rust/stockroom/src/stock/item.rs#L6)

#### `name` {#symbol-name}
- Type: field
- Source: [source](../../../../../../../../../tests/integration/programs/rust/stockroom/src/stock/item.rs#L7)

#### `new` {#symbol-new}
- Type: method
- Source: [source](../../../../../../../../../tests/integration/programs/rust/stockroom/src/stock/item.rs#L12)

##### `new` — Summary
A new item.

#### `describe` {#symbol-describe}
- Type: method
- Source: [source](../../../../../../../../../tests/integration/programs/rust/stockroom/src/stock/item.rs#L17)
- Parameters: `quantity`: [`Quantity`](./quantity.rs.mdmd.md#symbol-quantity)

##### `describe` — Summary
The item as a report line.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`stock`](../stock.rs.mdmd.md)
- [`Quantity`](./quantity.rs.mdmd.md#symbol-quantity)
<!-- LIVE-DOC:END Dependencies -->
