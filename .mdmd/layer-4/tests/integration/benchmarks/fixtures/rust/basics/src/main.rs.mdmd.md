# tests/integration/benchmarks/fixtures/rust/basics/src/main.rs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/benchmarks/fixtures/rust/basics/src/main.rs
- Live Doc ID: LD-implementation-tests-integration-benchmarks-fixtures-rust-basics-src-main-rs
- Generated At: 2026-01-14T16:04:05.603Z

## Authored
### Purpose
Entry point for the `rust-basics` polyglot benchmark fixture. Declares module dependencies (`mod math; mod utils;`) to test Rust module resolution and cross-module dependency tracking in the Live Documentation system.

### Notes
- Created on [2025-10-31](../../../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-31.md) as part of T060 (curating AST benchmark fixtures) to expand polyglot inference accuracy testing beyond TypeScript and C.
- Dependency resolution enhanced on [2026-01-13](../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-13.1.md) when the Rust adapter gained `mod` declaration parsing and `use crate::` path resolution.
- The fixture demonstrates the `mod foo;` pattern where Rust looks for `foo.rs` or `foo/mod.rs` relative to the crate source root.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-14T16:04:05.603Z","inputHash":"03ee216fe2f9a36e"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`math`](./math.rs.mdmd.md)
- [`utils`](./utils.rs.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->
