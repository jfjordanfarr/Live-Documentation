# tests/integration/programs/rust/stockroom/src/lib.rs

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/rust/stockroom/src/lib.rs
- Live Doc ID: LD-test-tests-integration-programs-rust-stockroom-src-lib-rs
- Generated At: 2026-09-27T21:43:47.888Z

## Authored
### Purpose
The library root of the stockroom sample program: declares the `report`, `stock` and `store` modules and re-exports `Item` and `Memory`.

### Notes
- The root module every `crate::` path in the library names, and the module the binary and the integration test reach through the package name `stockroom`.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T21:43:47.888Z","inputHash":"af10ea4f8a7e4533"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `report` {#symbol-report}
- Type: module
- Source: [source](../../../../../../../../tests/integration/programs/rust/stockroom/src/lib.rs#L3)

#### `stock` {#symbol-stock}
- Type: module
- Source: [source](../../../../../../../../tests/integration/programs/rust/stockroom/src/lib.rs#L4)

#### `store` {#symbol-store}
- Type: module
- Source: [source](../../../../../../../../tests/integration/programs/rust/stockroom/src/lib.rs#L5)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`report`](./report.rs.mdmd.md)
- [`stock`](./stock.rs.mdmd.md)
- [`Item`](./stock/item.rs.mdmd.md#symbol-item)
- [`Memory`](./store/memory.rs.mdmd.md#symbol-memory)
- [`store`](./store/mod.rs.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->
