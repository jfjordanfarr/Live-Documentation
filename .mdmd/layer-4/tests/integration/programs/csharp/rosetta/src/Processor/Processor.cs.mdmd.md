# tests/integration/programs/csharp/rosetta/src/Processor/Processor.cs

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/csharp/rosetta/src/Processor/Processor.cs
- Generated At: 2026-09-27T23:21:35.393Z

## Authored
### Purpose
C# Rosetta Stone fixture source file. Part of the cross-language benchmark suite.

### Notes
See [2026-01-14.1.md](../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-14.1.md). Tests C# namespace using and type reference detection.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Processor` {#symbol-processor}
- Type: class
- Source: [source](../../../../../../../../../tests/integration/programs/csharp/rosetta/src/Processor/Processor.cs#L16)

##### `Processor` — Summary
Core processing logic for the Rosetta benchmark fixture.

This module exercises multiple import patterns:
- Using alias: `using RTypes = Rosetta.Types`
- Namespace imports: `using Rosetta.Models`
- Static imports from Helpers

#### `Run` {#symbol-run}
- Type: method
- Source: [source](../../../../../../../../../tests/integration/programs/csharp/rosetta/src/Processor/Processor.cs#L34)
- Returns: [`Report`](../Models/Report.cs.mdmd.md#symbol-report-class)
- Parameters: `records`: [`Record`](../Models/Record.cs.mdmd.md#symbol-record-class); `config`: [`ProcessorConfig`](../Types/ProcessorConfig.cs.mdmd.md#symbol-processorconfig)

##### `Run` — Summary
Processes a batch of records and generates a report.

Uses namespace alias (RTypes) to access ProcessorConfig,
demonstrating how adapters should handle aliased imports.

##### `Run` — Parameters
- `records`: Records to process
- `config`: Optional processing configuration

##### `Run` — Returns
Summary report of processed records

##### `Run` — Exceptions
- `ArgumentException`: Thrown when configuration is invalid

#### `Summarize` {#symbol-summarize}
- Type: method
- Source: [source](../../../../../../../../../tests/integration/programs/csharp/rosetta/src/Processor/Processor.cs#L56)
- Parameters: `report`: [`Report`](../Models/Report.cs.mdmd.md#symbol-report-class)

##### `Summarize` — Summary
Creates a formatted summary string from a report.

##### `Summarize` — Parameters
- `report`: Report to summarize

##### `Summarize` — Returns
Human-readable summary
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Helpers`](../Helpers/Helpers.cs.mdmd.md#symbol-helpers)
- [`ModelFactory`](../Models/ModelFactory.cs.mdmd.md#symbol-modelfactory)
- [`Record`](../Models/Record.cs.mdmd.md#symbol-record-class)
- [`Report`](../Models/Report.cs.mdmd.md#symbol-report-class)
- [`ProcessorConfig`](../Types/ProcessorConfig.cs.mdmd.md#symbol-processorconfig)
<!-- LIVE-DOC:END Dependencies -->
