# tests/integration/benchmarks/fixtures/rust/basics/src/math.rs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/benchmarks/fixtures/rust/basics/src/math.rs
- Live Doc ID: LD-implementation-tests-integration-benchmarks-fixtures-rust-basics-src-math-rs
- Generated At: 2026-02-03T21:55:46.031Z

## Authored
### Purpose
Mathematical operations module for the `rust-basics` polyglot benchmark fixture. Provides `sum` and `describe` functions that depend on `utils::is_even`, demonstrating cross-module Rust dependencies.

### Notes
- Created on [2025-10-31](../../../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-31.md) alongside the rest of the `rust-basics` fixture to test multi-hop dependency chains: `main.rs → math.rs → utils.rs`.
- Uses `use crate::utils;` syntax to import the sibling module, which the Rust adapter now resolves via the `resolveUseStatement()` function added on [2026-01-13](../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-13.1.md).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:46.031Z","inputHash":"229f83d7089c8b1b"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `sum` {#symbol-sum}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/rust/basics/src/math.rs#L3)

#### `describe` {#symbol-describe}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/rust/basics/src/math.rs#L7)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`utils`](./utils.rs.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->
