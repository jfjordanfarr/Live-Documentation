# tests/integration/programs/rust/analytics/src/analytics.rs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/rust/analytics/src/analytics.rs
- Generated At: 2026-10-02T20:20:08.453Z

## Authored
### Purpose
Coordinates the analytics pipeline for the Rust benchmark by combining metrics and models into a final summary with alerting.

### Notes
Keep the orchestrator lean; its job is to surface dependency edges across modules rather than add new logic.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `run_analysis` {#symbol-run_analysis}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/rust/analytics/src/analytics.rs#L4)
- Returns: [`Summary`](./models.rs.mdmd.md#symbol-summary)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`main`](./main.rs.mdmd.md)
- [`metrics.is_alert`](./metrics.rs.mdmd.md#symbol-is_alert)
- [`metrics.summarize`](./metrics.rs.mdmd.md#symbol-summarize)
- [`models.Sample`](./models.rs.mdmd.md#symbol-sample)
- [`models.Summary`](./models.rs.mdmd.md#symbol-summary)
<!-- LIVE-DOC:END Dependencies -->
