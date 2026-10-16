# tests/integration/programs/rust/basics/Cargo.toml

## Metadata
- Layer: 4
- Archetype: asset
- Code Path: tests/integration/programs/rust/basics/Cargo.toml
- Entry: tooling
- Generated At: 2026-10-16T16:21:57.002Z

## Authored
### Purpose
The `programs/rust/basics` sample's manifest: it names the crate `rust-basics-fixture` and depends on nothing. Its presence is what makes `oracle:index` choose rust-analyzer for the sample.

### Notes
- Plain on purpose; it is read by the Cargo adapter as a Live Doc since 2026-10-16 and must not change, since the sample's `expected/compiler-edges.json` is the indexer's output over it and names this file among its documents.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `rust-basics-fixture` {#symbol-rust-basics-fixture}
- Type: package
- Source: [source](../../../../../../../tests/integration/programs/rust/basics/Cargo.toml#L1)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
