# tests/integration/programs/rust/analytics/src/io.rs

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/rust/analytics/src/io.rs
- Live Doc ID: LD-test-tests-integration-programs-rust-analytics-src-io-rs
- Generated At: 2026-09-27T21:43:47.629Z

## Authored
### Purpose
Supplies deterministic sample data for the Rust analytics benchmark so the analyzer sees predictable IO-to-model dependencies.

### Notes
Adjust the shape of the sample sets only when the benchmark needs new dependency edges; keep labels simple for readability.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T21:43:47.629Z","inputHash":"c05d011e05a39bf7"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `load_series` {#symbol-load_series}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/rust/analytics/src/io.rs#L3)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`main`](./main.rs.mdmd.md)
- [`models.Sample`](./models.rs.mdmd.md#symbol-sample)
<!-- LIVE-DOC:END Dependencies -->
