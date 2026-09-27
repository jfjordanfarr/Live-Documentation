# tests/integration/programs/go/rosetta/src/models/models.go

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/go/rosetta/src/models/models.go
- Generated At: 2026-09-27T23:21:36.017Z

## Authored
### Purpose
Data model definitions and factory functions for the Go Rosetta Stone benchmark fixture.

### Notes
- Imports from types package to demonstrate type-to-model dependency edges.
- Factory pattern (`NewRecord`) enables test data generation in main entry point.
- Created 2026-01-15; see [2026-01-15.1.md](../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-15.1.md) for context.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Record` {#symbol-record}
- Type: struct
- Source: [source](../../../../../../../../../tests/integration/programs/go/rosetta/src/models/models.go#L12)
- Extends: [`Entry`](../types/types.go.mdmd.md#symbol-entry)

##### `Record` — Summary
Record represents a data record to be processed.

#### `Value` {#symbol-value}
- Type: field
- Source: [source](../../../../../../../../../tests/integration/programs/go/rosetta/src/models/models.go#L14)

#### `Tags` {#symbol-tags}
- Type: field
- Source: [source](../../../../../../../../../tests/integration/programs/go/rosetta/src/models/models.go#L15)

#### `Report` {#symbol-report}
- Type: struct
- Source: [source](../../../../../../../../../tests/integration/programs/go/rosetta/src/models/models.go#L19)

##### `Report` — Summary
Report represents a summary produced by the processor.

#### `Total` {#symbol-total}
- Type: field
- Source: [source](../../../../../../../../../tests/integration/programs/go/rosetta/src/models/models.go#L20)

#### `Average` {#symbol-average}
- Type: field
- Source: [source](../../../../../../../../../tests/integration/programs/go/rosetta/src/models/models.go#L21)

#### `Records` {#symbol-records}
- Type: field
- Source: [source](../../../../../../../../../tests/integration/programs/go/rosetta/src/models/models.go#L22)

#### `GeneratedAt` {#symbol-generatedat}
- Type: field
- Source: [source](../../../../../../../../../tests/integration/programs/go/rosetta/src/models/models.go#L23)

#### `CreateRecord` {#symbol-createrecord}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/programs/go/rosetta/src/models/models.go#L27)
- Returns: [`Record`](../../../../java/basic/src/com/example/model/Record.java.mdmd.md#symbol-record)

##### `CreateRecord` — Summary
CreateRecord is a factory for creating records with sensible defaults.

#### `ValidateConfig` {#symbol-validateconfig}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/programs/go/rosetta/src/models/models.go#L40)
- Parameters: `config`: [`ProcessorConfig`](../types/types.go.mdmd.md#symbol-processorconfig)

##### `ValidateConfig` — Summary
ValidateConfig validates that a configuration is within acceptable bounds.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.Entry`](../types/types.go.mdmd.md#symbol-entry)
- [`types.ProcessorConfig`](../types/types.go.mdmd.md#symbol-processorconfig)
- [`types.StatusPending`](../types/types.go.mdmd.md#symbol-statuspending)
<!-- LIVE-DOC:END Dependencies -->
