# tests/integration/programs/rust/basics/src/math.rs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/rust/basics/src/math.rs
- Generated At: 2026-10-02T20:20:08.561Z

## Authored
### Purpose
Mathematical operations module for the `rust-basics` polyglot benchmark fixture. Provides `sum` and `describe` functions that depend on `utils::is_even`, demonstrating cross-module Rust dependencies.

### Notes
- Created on [2025-10-31](../../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-31.md) alongside the rest of the `rust-basics` fixture to test multi-hop dependency chains: `main.rs → math.rs → utils.rs`.
- Uses `use crate::utils;` syntax to import the sibling module, which the Rust adapter now resolves via the `resolveUseStatement()` function added on [2026-01-13](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-13.1.md).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `sum` {#symbol-sum}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/rust/basics/src/math.rs#L3)

#### `describe` {#symbol-describe}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/rust/basics/src/math.rs#L7)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`main`](./main.rs.mdmd.md)
- [`utils.is_even`](./utils.rs.mdmd.md#symbol-is_even)
<!-- LIVE-DOC:END Dependencies -->
