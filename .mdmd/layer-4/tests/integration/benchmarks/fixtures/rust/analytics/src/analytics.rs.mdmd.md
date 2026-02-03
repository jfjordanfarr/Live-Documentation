# tests/integration/benchmarks/fixtures/rust/analytics/src/analytics.rs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/benchmarks/fixtures/rust/analytics/src/analytics.rs
- Live Doc ID: LD-implementation-tests-integration-benchmarks-fixtures-rust-analytics-src-analytics-rs
- Generated At: 2026-02-03T21:55:45.853Z

## Authored
### Purpose
Coordinates the analytics pipeline for the Rust benchmark by combining metrics and models into a final summary with alerting.

### Notes
Keep the orchestrator lean; its job is to surface dependency edges across modules rather than add new logic.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:45.853Z","inputHash":"198254c67ec90a0b"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `run_analysis` {#symbol-run_analysis}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/rust/analytics/src/analytics.rs#L4)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`metrics.is_alert`](./metrics.rs.mdmd.md#symbol-is_alert)
- [`metrics.summarize`](./metrics.rs.mdmd.md#symbol-summarize)
- [`models.Sample`](./models.rs.mdmd.md#symbol-sample)
- [`models.Summary`](./models.rs.mdmd.md#symbol-summary)
<!-- LIVE-DOC:END Dependencies -->
