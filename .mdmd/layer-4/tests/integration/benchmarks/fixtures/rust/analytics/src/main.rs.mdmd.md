# tests/integration/benchmarks/fixtures/rust/analytics/src/main.rs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/benchmarks/fixtures/rust/analytics/src/main.rs
- Live Doc ID: LD-implementation-tests-integration-benchmarks-fixtures-rust-analytics-src-main-rs
- Generated At: 2025-12-06T22:49:48.612Z

## Authored
### Purpose
Acts as the entry point for the Rust analytics benchmark, invoking IO and metrics modules so cross-crate imports are exercised.

### Notes
Maintain parity with the supporting modules; this file should stay lightweight to keep the dependency graph focused.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-06T22:49:48.612Z","inputHash":"1d247861a28b0ef6"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `analytics::run_analysis`
- `io::load_series`
<!-- LIVE-DOC:END Dependencies -->
