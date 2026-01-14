# tests/integration/benchmarks/fixtures/rust/analytics/src/main.rs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/benchmarks/fixtures/rust/analytics/src/main.rs
- Live Doc ID: LD-implementation-tests-integration-benchmarks-fixtures-rust-analytics-src-main-rs
- Generated At: 2026-01-14T16:04:05.600Z

## Authored
### Purpose
Acts as the entry point for the Rust analytics benchmark, invoking IO and metrics modules so cross-crate imports are exercised.

### Notes
Maintain parity with the supporting modules; this file should stay lightweight to keep the dependency graph focused.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-14T16:04:05.600Z","inputHash":"36b40d54877a73f5"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `analytics::run_analysis`
- `io::load_series`
- [`analytics`](./analytics.rs.mdmd.md)
- [`io`](./io.rs.mdmd.md)
- [`metrics`](./metrics.rs.mdmd.md)
- [`models`](./models.rs.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->
