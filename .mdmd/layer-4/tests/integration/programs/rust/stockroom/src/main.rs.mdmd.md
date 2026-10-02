# tests/integration/programs/rust/stockroom/src/main.rs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/rust/stockroom/src/main.rs
- Generated At: 2026-10-02T20:20:08.727Z

## Authored
### Purpose
The binary of the stockroom sample program: receives two items into a `Memory` inventory and prints the report, using the library by its package name.

### Notes
- Every path here starts with `stockroom`, the library crate, which the adapter resolves to `src/lib.rs` and then through its re-exports; a comment and a string mention `store::Inventory` and `stock::Item`, neither a reference.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`lib`](./lib.rs.mdmd.md)
- [`report.write`](./report.rs.mdmd.md#symbol-write)
- [`stock`](./stock.rs.mdmd.md)
- [`Item`](./stock/item.rs.mdmd.md#symbol-item)
- [`Quantity`](./stock/quantity.rs.mdmd.md#symbol-quantity)
- [`quantity.Unit`](./stock/quantity.rs.mdmd.md#symbol-unit-enum)
- [`Memory`](./store/memory.rs.mdmd.md#symbol-memory)
- [`store.Inventory`](./store/mod.rs.mdmd.md#symbol-inventory)
<!-- LIVE-DOC:END Dependencies -->
