# tests/integration/fixtures/manifests/workspace/rust/stockctl/Cargo.toml

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/manifests/workspace/rust/stockctl/Cargo.toml
- Entry: tooling
- Generated At: 2026-10-16T20:40:24.945Z

## Authored
### Purpose
The manifests fixture's binary crate: it names the crate `stockctl`, writes a `[[bin]]` named `count` with a path, and depends on `stock` by path, so that its doc links `stock`'s manifest and `src/main.rs` carries the command.

### Notes
- Written 2026-10-16 for `tests/integration/live-docs/manifests.test.ts`. A binary named apart from its package at `src/main.rs` is a common form; `cargo metadata` lists `count` as the crate's one binary target.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `stockctl` {#symbol-stockctl}
- Type: package
- Source: [source](../../../../../../../../../tests/integration/fixtures/manifests/workspace/rust/stockctl/Cargo.toml#L1)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Cargo.stock`](../stock/Cargo.toml.mdmd.md#symbol-stock)
<!-- LIVE-DOC:END Dependencies -->
