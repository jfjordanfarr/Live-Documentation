# tests/integration/programs/rust/rosetta/src/models.rs

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/rust/rosetta/src/models.rs
- Live Doc ID: LD-test-tests-integration-programs-rust-rosetta-src-models-rs
- Generated At: 2026-09-27T20:50:54.135Z

## Authored
### Purpose
Rust Rosetta Stone fixture module. Part of the cross-language benchmark suite.

### Notes
See [2026-01-14.1.md](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-14.1.md). Tests Rust use statement and pub use re-export detection.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T20:50:54.135Z","inputHash":"5f1a6d3fc0eba82b"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Record` {#symbol-record}
- Type: struct
- Source: [source](../../../../../../../../tests/integration/programs/rust/rosetta/src/models.rs#L10)

##### `Record` — Summary
A data record to be processed.

#### `entry` {#symbol-entry}
- Type: field
- Source: [source](../../../../../../../../tests/integration/programs/rust/rosetta/src/models.rs#L11)

#### `value` {#symbol-value}
- Type: field
- Source: [source](../../../../../../../../tests/integration/programs/rust/rosetta/src/models.rs#L12)

#### `tags` {#symbol-tags}
- Type: field
- Source: [source](../../../../../../../../tests/integration/programs/rust/rosetta/src/models.rs#L13)

#### `new (method overload 1)` {#symbol-new-method-overload-1}
- Type: method
- Source: [source](../../../../../../../../tests/integration/programs/rust/rosetta/src/models.rs#L18)

##### `new (method overload 1)` — Summary
Creates a new record with sensible defaults.

#### `Report` {#symbol-report}
- Type: struct
- Source: [source](../../../../../../../../tests/integration/programs/rust/rosetta/src/models.rs#L38)

##### `Report` — Summary
Summary report produced by the processor.

#### `total` {#symbol-total}
- Type: field
- Source: [source](../../../../../../../../tests/integration/programs/rust/rosetta/src/models.rs#L39)

#### `average` {#symbol-average}
- Type: field
- Source: [source](../../../../../../../../tests/integration/programs/rust/rosetta/src/models.rs#L40)

#### `records` {#symbol-records}
- Type: field
- Source: [source](../../../../../../../../tests/integration/programs/rust/rosetta/src/models.rs#L41)

#### `generated_at` {#symbol-generated_at}
- Type: field
- Source: [source](../../../../../../../../tests/integration/programs/rust/rosetta/src/models.rs#L42)

#### `new (method overload 2)` {#symbol-new-method-overload-2}
- Type: method
- Source: [source](../../../../../../../../tests/integration/programs/rust/rosetta/src/models.rs#L47)

##### `new (method overload 2)` — Summary
Creates a new report with the current timestamp.

#### `create_record` {#symbol-create_record}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/rust/rosetta/src/models.rs#L58)
- Returns: [`Record`](../../../java/basic/src/com/example/model/Record.java.mdmd.md#symbol-record)

##### `create_record` — Summary
Factory function for creating records with sensible defaults.

#### `validate_config` {#symbol-validate_config}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/rust/rosetta/src/models.rs#L63)
- Parameters: `config`: [`ProcessorConfig`](./types.rs.mdmd.md#symbol-processorconfig)

##### `validate_config` — Summary
Validates configuration is within acceptable bounds.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`main`](./main.rs.mdmd.md)
- [`types.Entry`](./types.rs.mdmd.md#symbol-entry)
- [`types.ProcessorConfig`](./types.rs.mdmd.md#symbol-processorconfig)
- [`types.Status`](./types.rs.mdmd.md#symbol-status-enum)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
