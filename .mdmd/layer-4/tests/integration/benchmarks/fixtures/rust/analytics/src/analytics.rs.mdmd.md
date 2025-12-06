# tests/integration/benchmarks/fixtures/rust/analytics/src/analytics.rs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/benchmarks/fixtures/rust/analytics/src/analytics.rs
- Live Doc ID: LD-implementation-tests-integration-benchmarks-fixtures-rust-analytics-src-analytics-rs
- Generated At: 2025-12-06T22:49:48.604Z

## Authored
### Purpose
Coordinates the analytics pipeline for the Rust benchmark by combining metrics and models into a final summary with alerting.

### Notes
Keep the orchestrator lean; its job is to surface dependency edges across modules rather than add new logic.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-06T22:49:48.604Z","inputHash":"c712f84262d1d90f"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `run_analysis` {#symbol-run_analysis}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/rust/analytics/src/analytics.rs#L4)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `crate::metrics::{is_alert, summarize}`
- `crate::models::{Sample, Summary}`
<!-- LIVE-DOC:END Dependencies -->
