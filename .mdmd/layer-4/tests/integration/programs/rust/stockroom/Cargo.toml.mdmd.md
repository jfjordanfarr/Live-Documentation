# tests/integration/programs/rust/stockroom/Cargo.toml

## Metadata
- Layer: 4
- Archetype: asset
- Code Path: tests/integration/programs/rust/stockroom/Cargo.toml
- Entry: tooling
- Generated At: 2026-10-16T16:21:57.216Z

## Authored
### Purpose
The `programs/rust/stockroom` sample's manifest: it names the crate `stockroom`, whose library and binary Cargo finds at their conventional paths, and lists an empty `[dependencies]`. Its presence is what makes `oracle:index` choose rust-analyzer for the sample.

### Notes
- Plain on purpose; it is read by the Cargo adapter as a Live Doc since 2026-10-16 and must not change, since the sample's `expected/compiler-edges.json` is the indexer's output over it and names this file among its documents.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `stockroom` {#symbol-stockroom}
- Type: package
- Source: [source](../../../../../../../tests/integration/programs/rust/stockroom/Cargo.toml#L1)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
