# tests/integration/benchmarks/fixtures/rust/analytics/src/io.rs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/benchmarks/fixtures/rust/analytics/src/io.rs
- Live Doc ID: LD-implementation-tests-integration-benchmarks-fixtures-rust-analytics-src-io-rs
- Generated At: 2026-02-03T21:55:45.876Z

## Authored
### Purpose
Supplies deterministic sample data for the Rust analytics benchmark so the analyzer sees predictable IO-to-model dependencies.

### Notes
Adjust the shape of the sample sets only when the benchmark needs new dependency edges; keep labels simple for readability.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:45.876Z","inputHash":"7e23d216632076c2"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `load_series` {#symbol-load_series}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/rust/analytics/src/io.rs#L3)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`models`](./models.rs.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->
