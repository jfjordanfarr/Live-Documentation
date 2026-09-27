# tests/integration/programs/rust/rosetta/src/processor.rs

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/rust/rosetta/src/processor.rs
- Live Doc ID: LD-test-tests-integration-programs-rust-rosetta-src-processor-rs
- Generated At: 2026-09-27T21:43:47.833Z

## Authored
### Purpose
Rust Rosetta Stone fixture module. Part of the cross-language benchmark suite.

### Notes
See [2026-01-14.1.md](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-14.1.md). Tests Rust use statement and pub use re-export detection.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T21:43:47.833Z","inputHash":"7fddd275091c12ad"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `run` {#symbol-run}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/rust/rosetta/src/processor.rs#L31)
- Returns: [`Report`](./models.rs.mdmd.md#symbol-report)

##### `run` — Summary
Processes a batch of records and generates a report.

##### `run` — Remarks
Uses module imports to access Record and Report types,
demonstrating how adapters should handle various use patterns.

##### `run` — Parameters
- `records`: Records to process
- `config`: Optional processing configuration

##### `run` — Returns
Summary report of processed records

##### `run` — Exceptions
- `Panics`: Panics if configuration is invalid

#### `summarize` {#symbol-summarize}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/rust/rosetta/src/processor.rs#L52)
- Parameters: `report`: [`Report`](./models.rs.mdmd.md#symbol-report)

##### `summarize` — Summary
Creates a formatted summary string from a report.

##### `summarize` — Parameters
- `report`: Report to summarize

##### `summarize` — Returns
Human-readable summary
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`helpers.average`](./helpers.rs.mdmd.md#symbol-average)
- [`helpers.format`](./helpers.rs.mdmd.md#symbol-format)
- [`helpers.sum`](./helpers.rs.mdmd.md#symbol-sum)
- [`main`](./main.rs.mdmd.md)
- [`models.Record`](./models.rs.mdmd.md#symbol-record)
- [`models.Report`](./models.rs.mdmd.md#symbol-report)
- [`models.validate_config`](./models.rs.mdmd.md#symbol-validate_config)
- [`types.ProcessorConfig`](./types.rs.mdmd.md#symbol-processorconfig)
<!-- LIVE-DOC:END Dependencies -->
