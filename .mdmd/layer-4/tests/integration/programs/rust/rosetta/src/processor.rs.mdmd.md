# tests/integration/programs/rust/rosetta/src/processor.rs

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/rust/rosetta/src/processor.rs
- Live Doc ID: LD-test-tests-integration-programs-rust-rosetta-src-processor-rs
- Generated At: 2026-09-27T18:53:08.368Z

## Authored
### Purpose
Rust Rosetta Stone fixture module. Part of the cross-language benchmark suite.

### Notes
See [2026-01-14.1.md](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-14.1.md). Tests Rust use statement and pub use re-export detection.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T18:53:08.368Z","inputHash":"79373f421ab45220"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `run` {#symbol-run}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/rust/rosetta/src/processor.rs#L31)

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
- [`models.Record`](./models.rs.mdmd.md#symbol-record)
- [`models.Report`](./models.rs.mdmd.md#symbol-report)
- [`models.validate_config`](./models.rs.mdmd.md#symbol-validate_config)
- [`types`](./types.rs.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
