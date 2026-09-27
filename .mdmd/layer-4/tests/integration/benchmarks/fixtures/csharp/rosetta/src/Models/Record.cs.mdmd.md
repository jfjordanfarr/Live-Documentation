# tests/integration/benchmarks/fixtures/csharp/rosetta/src/Models/Record.cs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/benchmarks/fixtures/csharp/rosetta/src/Models/Record.cs
- Live Doc ID: LD-implementation-tests-integration-benchmarks-fixtures-csharp-rosetta-src-models-record-cs
- Generated At: 2026-09-27T18:34:28.732Z

## Authored
### Purpose
C# Rosetta Stone fixture source file. Part of the cross-language benchmark suite.

### Notes
See [2026-01-14.1.md](../../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-14.1.md). Tests C# namespace using and type reference detection.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T18:34:28.732Z","inputHash":"5b3b1d9b9156c62c"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Record (class)` {#symbol-record-class}
- Type: class
- Source: [source](../../../../../../../../../../tests/integration/benchmarks/fixtures/csharp/rosetta/src/Models/Record.cs#L8)
- Extends: [`Entry`](../Types/Entry.cs.mdmd.md#symbol-entry-class)

##### `Record (class)` — Summary
A data record to be processed.

#### `Value` {#symbol-value}
- Type: property
- Source: [source](../../../../../../../../../../tests/integration/benchmarks/fixtures/csharp/rosetta/src/Models/Record.cs#L10)

#### `Tags` {#symbol-tags}
- Type: property
- Source: [source](../../../../../../../../../../tests/integration/benchmarks/fixtures/csharp/rosetta/src/Models/Record.cs#L11)

#### `Record (constructor)` {#symbol-record-constructor}
- Type: constructor
- Source: [source](../../../../../../../../../../tests/integration/benchmarks/fixtures/csharp/rosetta/src/Models/Record.cs#L13)

#### `Create` {#symbol-create}
- Type: method
- Source: [source](../../../../../../../../../../tests/integration/benchmarks/fixtures/csharp/rosetta/src/Models/Record.cs#L23)
- Returns: [`Record`](../../../basic/src/Diagnostics/Models/Record.cs.mdmd.md#symbol-record)

##### `Create` — Summary
Factory method for creating records with sensible defaults.

#### `ValidateConfig` {#symbol-validateconfig}
- Type: method
- Source: [source](../../../../../../../../../../tests/integration/benchmarks/fixtures/csharp/rosetta/src/Models/Record.cs#L30)
- Parameters: `config`: [`ProcessorConfig`](../Types/ProcessorConfig.cs.mdmd.md#symbol-processorconfig)

##### `ValidateConfig` — Summary
Validates configuration is within acceptable bounds.
Delegates to ModelFactory.ValidateConfig for actual validation.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`ModelFactory`](./ModelFactory.cs.mdmd.md#symbol-modelfactory)
- [`Entry`](../Types/Entry.cs.mdmd.md#symbol-entry-class)
- [`ProcessorConfig`](../Types/ProcessorConfig.cs.mdmd.md#symbol-processorconfig)
- [`Status`](../Types/Status.cs.mdmd.md#symbol-status)
<!-- LIVE-DOC:END Dependencies -->
