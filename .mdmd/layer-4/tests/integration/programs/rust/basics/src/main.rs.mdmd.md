# tests/integration/programs/rust/basics/src/main.rs

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/rust/basics/src/main.rs
- Live Doc ID: LD-test-tests-integration-programs-rust-basics-src-main-rs
- Generated At: 2026-09-27T18:53:08.205Z

## Authored
### Purpose
Entry point for the `rust-basics` polyglot benchmark fixture. Declares module dependencies (`mod math; mod utils;`) to test Rust module resolution and cross-module dependency tracking in the Live Documentation system.

### Notes
- Created on [2025-10-31](../../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-31.md) as part of T060 (curating AST benchmark fixtures) to expand polyglot inference accuracy testing beyond TypeScript and C.
- Dependency resolution enhanced on [2026-01-13](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-13.1.md) when the Rust adapter gained `mod` declaration parsing and `use crate::` path resolution.
- The fixture demonstrates the `mod foo;` pattern where Rust looks for `foo.rs` or `foo/mod.rs` relative to the crate source root.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T18:53:08.205Z","inputHash":"025fa1df3b8d6e77"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`math`](./math.rs.mdmd.md)
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
