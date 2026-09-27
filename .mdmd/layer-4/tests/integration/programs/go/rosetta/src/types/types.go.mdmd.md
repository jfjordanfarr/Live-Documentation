# tests/integration/programs/go/rosetta/src/types/types.go

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/go/rosetta/src/types/types.go
- Live Doc ID: LD-test-tests-integration-programs-go-rosetta-src-types-types-go
- Generated At: 2026-09-27T21:43:45.135Z

## Authored
### Purpose
Foundational type definitions for the Go Rosetta Stone benchmark, establishing the Record struct and ProcessResult type.

### Notes
- Leaf node in the dependency graph (no imports from other Rosetta packages).
- Types consumed by models, helpers, and processor packages to form the complete dependency chain.
- Created 2026-01-15; see [2026-01-15.1.md](../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-15.1.md) for context.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T21:43:45.135Z","inputHash":"cd22c391d72aba8a"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Status (type)` {#symbol-status-type}
- Type: type
- Source: [source](../../../../../../../../../tests/integration/programs/go/rosetta/src/types/types.go#L8)

##### `Status (type)` — Summary
Status represents the state of a record in the pipeline.

#### `StatusPending` {#symbol-statuspending}
- Type: constant
- Source: [source](../../../../../../../../../tests/integration/programs/go/rosetta/src/types/types.go#L12)

##### `StatusPending` — Summary
StatusPending indicates a record awaiting processing.

#### `StatusActive` {#symbol-statusactive}
- Type: constant
- Source: [source](../../../../../../../../../tests/integration/programs/go/rosetta/src/types/types.go#L14)

##### `StatusActive` — Summary
StatusActive indicates a record being processed.

#### `StatusComplete` {#symbol-statuscomplete}
- Type: constant
- Source: [source](../../../../../../../../../tests/integration/programs/go/rosetta/src/types/types.go#L16)

##### `StatusComplete` — Summary
StatusComplete indicates a processed record.

#### `Entry` {#symbol-entry}
- Type: struct
- Source: [source](../../../../../../../../../tests/integration/programs/go/rosetta/src/types/types.go#L20)

##### `Entry` — Summary
Entry represents a timestamped item in the data pipeline.

#### `ID` {#symbol-id}
- Type: field
- Source: [source](../../../../../../../../../tests/integration/programs/go/rosetta/src/types/types.go#L21)

#### `Timestamp` {#symbol-timestamp}
- Type: field
- Source: [source](../../../../../../../../../tests/integration/programs/go/rosetta/src/types/types.go#L22)

#### `Status (field)` {#symbol-status-field}
- Type: field
- Source: [source](../../../../../../../../../tests/integration/programs/go/rosetta/src/types/types.go#L23)

#### `ProcessorConfig` {#symbol-processorconfig}
- Type: struct
- Source: [source](../../../../../../../../../tests/integration/programs/go/rosetta/src/types/types.go#L27)

##### `ProcessorConfig` — Summary
ProcessorConfig holds configuration for processing operations.

#### `BatchSize` {#symbol-batchsize}
- Type: field
- Source: [source](../../../../../../../../../tests/integration/programs/go/rosetta/src/types/types.go#L28)

#### `Timeout` {#symbol-timeout}
- Type: field
- Source: [source](../../../../../../../../../tests/integration/programs/go/rosetta/src/types/types.go#L29)

#### `Strict` {#symbol-strict}
- Type: field
- Source: [source](../../../../../../../../../tests/integration/programs/go/rosetta/src/types/types.go#L30)

#### `NewProcessorConfig` {#symbol-newprocessorconfig}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/programs/go/rosetta/src/types/types.go#L34)
- Returns: [`ProcessorConfig`](../../../../java/rosetta/src/com/rosetta/types/ProcessorConfig.java.mdmd.md#symbol-processorconfig-class)

##### `NewProcessorConfig` — Summary
NewProcessorConfig creates a ProcessorConfig with the given parameters.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
