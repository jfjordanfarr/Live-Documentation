# tests/integration/programs/rust/analytics/src/analytics.rs

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/rust/analytics/src/analytics.rs
- Live Doc ID: LD-test-tests-integration-programs-rust-analytics-src-analytics-rs
- Generated At: 2026-09-27T20:50:53.962Z

## Authored
### Purpose
Coordinates the analytics pipeline for the Rust benchmark by combining metrics and models into a final summary with alerting.

### Notes
Keep the orchestrator lean; its job is to surface dependency edges across modules rather than add new logic.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T20:50:53.962Z","inputHash":"c951295fa97e4b76"}]} -->
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

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
