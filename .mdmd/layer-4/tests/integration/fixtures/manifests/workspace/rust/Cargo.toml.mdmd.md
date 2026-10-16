# tests/integration/fixtures/manifests/workspace/rust/Cargo.toml

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/manifests/workspace/rust/Cargo.toml
- Entry: tooling
- Generated At: 2026-10-16T20:40:24.817Z

## Authored
### Purpose
The manifests fixture's Cargo workspace root: it lists the crates `stock` and `stockctl` as members and has no `[package]`, so that its doc publishes no symbol and is still a tooling entry.

### Notes
- Written 2026-10-16 for `tests/integration/live-docs/manifests.test.ts`; the fixture is copied to a temporary workspace before generating and never written to. `cargo run --offline --bin count` over a copy prints 7.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
