# tests/integration/benchmarks/fixtures/go/rosetta/src/models/models.go

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/benchmarks/fixtures/go/rosetta/src/models/models.go
- Live Doc ID: LD-implementation-tests-integration-benchmarks-fixtures-go-rosetta-src-models-models-go
- Generated At: 2026-02-03T21:55:43.627Z

## Authored
### Purpose
Data model definitions and factory functions for the Go Rosetta Stone benchmark fixture.

### Notes
- Imports from types package to demonstrate type-to-model dependency edges.
- Factory pattern (`NewRecord`) enables test data generation in main entry point.
- Created 2026-01-15; see [2026-01-15.1.md](../../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-15.1.md) for context.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:43.627Z","inputHash":"b1a7856153aa1200"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Record` {#symbol-record}
- Type: struct
- Source: [source](../../../../../../../../../../tests/integration/benchmarks/fixtures/go/rosetta/src/models/models.go#L12)

##### `Record` — Summary
Record represents a data record to be processed.

#### `Report` {#symbol-report}
- Type: struct
- Source: [source](../../../../../../../../../../tests/integration/benchmarks/fixtures/go/rosetta/src/models/models.go#L19)

##### `Report` — Summary
Report represents a summary produced by the processor.

#### `CreateRecord` {#symbol-createrecord}
- Type: function
- Source: [source](../../../../../../../../../../tests/integration/benchmarks/fixtures/go/rosetta/src/models/models.go#L27)

##### `CreateRecord` — Summary
CreateRecord is a factory for creating records with sensible defaults.

#### `ValidateConfig` {#symbol-validateconfig}
- Type: function
- Source: [source](../../../../../../../../../../tests/integration/benchmarks/fixtures/go/rosetta/src/models/models.go#L40)

##### `ValidateConfig` — Summary
ValidateConfig validates that a configuration is within acceptable bounds.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.Entry`](../types/types.go.mdmd.md#symbol-entry)
- [`types.ProcessorConfig`](../types/types.go.mdmd.md#symbol-processorconfig)
- [`types.StatusPending`](../types/types.go.mdmd.md#symbol-statuspending)
<!-- LIVE-DOC:END Dependencies -->
