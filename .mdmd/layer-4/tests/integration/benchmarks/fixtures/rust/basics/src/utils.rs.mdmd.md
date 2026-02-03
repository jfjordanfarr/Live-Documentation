# tests/integration/benchmarks/fixtures/rust/basics/src/utils.rs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/benchmarks/fixtures/rust/basics/src/utils.rs
- Live Doc ID: LD-implementation-tests-integration-benchmarks-fixtures-rust-basics-src-utils-rs
- Generated At: 2026-02-03T21:55:46.050Z

## Authored
### Purpose
Utility functions module for the `rust-basics` polyglot benchmark fixture. Provides `is_even` and `clamp` helpers with no external dependencies, serving as a leaf node in the dependency graph.

### Notes
- Created on [2025-10-31](../../../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-31.md) as the foundational leaf module for the `rust-basics` fixture's dependency chain.
- Being a leaf node (no dependencies), this module is critical for testing that the Live Documentation system correctly identifies terminal nodes in the graph.
- The `is_even` function is consumed by both `main.rs` and `math.rs`, making it a high-fan-in artifact useful for change impact analysis testing.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:46.050Z","inputHash":"e73791c8254f100c"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `is_even` {#symbol-is_even}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/rust/basics/src/utils.rs#L1)

#### `clamp` {#symbol-clamp}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/rust/basics/src/utils.rs#L5)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
