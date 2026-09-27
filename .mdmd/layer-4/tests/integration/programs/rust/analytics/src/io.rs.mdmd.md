# tests/integration/programs/rust/analytics/src/io.rs

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/rust/analytics/src/io.rs
- Generated At: 2026-09-27T23:21:38.815Z

## Authored
### Purpose
Supplies deterministic sample data for the Rust analytics benchmark so the analyzer sees predictable IO-to-model dependencies.

### Notes
Adjust the shape of the sample sets only when the benchmark needs new dependency edges; keep labels simple for readability.

## Generated
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
