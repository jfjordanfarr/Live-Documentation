# tests/integration/programs/rust/basics/src/math.rs

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/rust/basics/src/math.rs
- Live Doc ID: LD-test-tests-integration-programs-rust-basics-src-math-rs
- Generated At: 2026-09-27T18:53:08.223Z

## Authored
### Purpose
Mathematical operations module for the `rust-basics` polyglot benchmark fixture. Provides `sum` and `describe` functions that depend on `utils::is_even`, demonstrating cross-module Rust dependencies.

### Notes
- Created on [2025-10-31](../../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-31.md) alongside the rest of the `rust-basics` fixture to test multi-hop dependency chains: `main.rs → math.rs → utils.rs`.
- Uses `use crate::utils;` syntax to import the sibling module, which the Rust adapter now resolves via the `resolveUseStatement()` function added on [2026-01-13](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-13.1.md).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T18:53:08.223Z","inputHash":"94744b4fce741bdb"}]} -->
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
- [`utils`](./utils.rs.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
