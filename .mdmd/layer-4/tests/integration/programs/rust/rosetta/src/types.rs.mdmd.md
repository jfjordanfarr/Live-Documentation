# tests/integration/programs/rust/rosetta/src/types.rs

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/rust/rosetta/src/types.rs
- Live Doc ID: LD-test-tests-integration-programs-rust-rosetta-src-types-rs
- Generated At: 2026-09-27T21:43:47.861Z

## Authored
### Purpose
Rust Rosetta Stone fixture module. Part of the cross-language benchmark suite.

### Notes
See [2026-01-14.1.md](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-14.1.md). Tests Rust use statement and pub use re-export detection.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T21:43:47.861Z","inputHash":"bdb08eaf76eb5b27"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Status (enum)` {#symbol-status-enum}
- Type: enum
- Source: [source](../../../../../../../../tests/integration/programs/rust/rosetta/src/types.rs#L8)

##### `Status (enum)` — Summary
Status enumeration for records.

#### `Pending` {#symbol-pending}
- Type: variant
- Source: [source](../../../../../../../../tests/integration/programs/rust/rosetta/src/types.rs#L9)

#### `Active` {#symbol-active}
- Type: variant
- Source: [source](../../../../../../../../tests/integration/programs/rust/rosetta/src/types.rs#L10)

#### `Complete` {#symbol-complete}
- Type: variant
- Source: [source](../../../../../../../../tests/integration/programs/rust/rosetta/src/types.rs#L11)

#### `Entry` {#symbol-entry}
- Type: struct
- Source: [source](../../../../../../../../tests/integration/programs/rust/rosetta/src/types.rs#L16)

##### `Entry` — Summary
A timestamped entry in the data pipeline.

#### `id` {#symbol-id}
- Type: field
- Source: [source](../../../../../../../../tests/integration/programs/rust/rosetta/src/types.rs#L17)

#### `timestamp` {#symbol-timestamp}
- Type: field
- Source: [source](../../../../../../../../tests/integration/programs/rust/rosetta/src/types.rs#L18)

#### `status (field)` {#symbol-status-field}
- Type: field
- Source: [source](../../../../../../../../tests/integration/programs/rust/rosetta/src/types.rs#L19)

#### `ProcessorConfig` {#symbol-processorconfig}
- Type: struct
- Source: [source](../../../../../../../../tests/integration/programs/rust/rosetta/src/types.rs#L24)

##### `ProcessorConfig` — Summary
Configuration for processing operations.

#### `batch_size` {#symbol-batch_size}
- Type: field
- Source: [source](../../../../../../../../tests/integration/programs/rust/rosetta/src/types.rs#L25)

#### `timeout` {#symbol-timeout}
- Type: field
- Source: [source](../../../../../../../../tests/integration/programs/rust/rosetta/src/types.rs#L26)

#### `strict` {#symbol-strict}
- Type: field
- Source: [source](../../../../../../../../tests/integration/programs/rust/rosetta/src/types.rs#L27)

#### `new` {#symbol-new}
- Type: method
- Source: [source](../../../../../../../../tests/integration/programs/rust/rosetta/src/types.rs#L32)

##### `new` — Summary
Creates a new processor configuration.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
