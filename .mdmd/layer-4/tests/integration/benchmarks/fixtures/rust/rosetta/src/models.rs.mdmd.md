# tests/integration/benchmarks/fixtures/rust/rosetta/src/models.rs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/benchmarks/fixtures/rust/rosetta/src/models.rs
- Live Doc ID: LD-implementation-tests-integration-benchmarks-fixtures-rust-rosetta-src-models-rs
- Generated At: 2026-02-03T21:55:46.195Z

## Authored
### Purpose
Rust Rosetta Stone fixture module. Part of the cross-language benchmark suite.

### Notes
See [2026-01-14.1.md](../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-14.1.md). Tests Rust use statement and pub use re-export detection.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:46.195Z","inputHash":"6060f4c1766406f9"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Record` {#symbol-record}
- Type: struct
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/rust/rosetta/src/models.rs#L10)

##### `Record` — Summary
A data record to be processed.

#### `new (function overload 1)` {#symbol-new-function-overload-1}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/rust/rosetta/src/models.rs#L18)

##### `new (function overload 1)` — Summary
Creates a new record with sensible defaults.

#### `Report` {#symbol-report}
- Type: struct
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/rust/rosetta/src/models.rs#L38)

##### `Report` — Summary
Summary report produced by the processor.

#### `new (function overload 2)` {#symbol-new-function-overload-2}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/rust/rosetta/src/models.rs#L47)

##### `new (function overload 2)` — Summary
Creates a new report with the current timestamp.

#### `create_record` {#symbol-create_record}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/rust/rosetta/src/models.rs#L58)

##### `create_record` — Summary
Factory function for creating records with sensible defaults.

#### `validate_config` {#symbol-validate_config}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/rust/rosetta/src/models.rs#L63)

##### `validate_config` — Summary
Validates configuration is within acceptable bounds.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `std::time::{SystemTime, UNIX_EPOCH}` - `SystemTime`, `UNIX_EPOCH`
- [`types.Entry`](./types.rs.mdmd.md#symbol-entry)
- [`types.ProcessorConfig`](./types.rs.mdmd.md#symbol-processorconfig)
- [`types.Status`](./types.rs.mdmd.md#symbol-status)
<!-- LIVE-DOC:END Dependencies -->
