# tests/integration/fixtures/manifests/workspace/rust/stock/Cargo.toml

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/manifests/workspace/rust/stock/Cargo.toml
- Entry: tooling
- Generated At: 2026-10-16T20:40:24.867Z

## Authored
### Purpose
The manifests fixture's library crate: it names the crate `stock` and writes its `[lib]` with a path, so that `src/lib.rs` is declared as the package's module.

### Notes
- Written 2026-10-16 for `tests/integration/live-docs/manifests.test.ts`. The path is the conventional one, so that the Rust adapter, which knows crate roots only there, also resolves `use stock::...` to it.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `stock` {#symbol-stock}
- Type: package
- Source: [source](../../../../../../../../../tests/integration/fixtures/manifests/workspace/rust/stock/Cargo.toml#L1)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
