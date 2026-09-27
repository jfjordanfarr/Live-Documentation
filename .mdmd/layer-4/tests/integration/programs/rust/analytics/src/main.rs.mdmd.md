# tests/integration/programs/rust/analytics/src/main.rs

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/rust/analytics/src/main.rs
- Live Doc ID: LD-test-tests-integration-programs-rust-analytics-src-main-rs
- Generated At: 2026-09-27T21:43:47.642Z

## Authored
### Purpose
Acts as the entry point for the Rust analytics benchmark, invoking IO and metrics modules so cross-crate imports are exercised.

### Notes
Maintain parity with the supporting modules; this file should stay lightweight to keep the dependency graph focused.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T21:43:47.642Z","inputHash":"9a15da0f1430f7ec"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`analytics.run_analysis`](./analytics.rs.mdmd.md#symbol-run_analysis)
- [`io.load_series`](./io.rs.mdmd.md#symbol-load_series)
- [`metrics`](./metrics.rs.mdmd.md)
- [`models`](./models.rs.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->
