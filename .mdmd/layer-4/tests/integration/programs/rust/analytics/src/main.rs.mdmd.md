# tests/integration/programs/rust/analytics/src/main.rs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/rust/analytics/src/main.rs
- Generated At: 2026-10-02T20:20:08.480Z

## Authored
### Purpose
Acts as the entry point for the Rust analytics benchmark, invoking IO and metrics modules so cross-crate imports are exercised.

### Notes
Maintain parity with the supporting modules; this file should stay lightweight to keep the dependency graph focused.

## Generated
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
