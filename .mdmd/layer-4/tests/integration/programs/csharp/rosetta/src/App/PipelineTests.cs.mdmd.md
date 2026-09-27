# tests/integration/programs/csharp/rosetta/src/App/PipelineTests.cs

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/csharp/rosetta/src/App/PipelineTests.cs
- Generated At: 2026-09-27T23:21:35.271Z

## Authored
### Purpose
xUnit integration tests for the C# Rosetta data processing pipeline.

### Notes
Created as part of Goal 2 (Rosetta Tests) during [Dev Day 60](../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-16.1.md). Exercises NON-name-matched test detection through `using Rosetta.Models` and `using Rosetta.Processor` namespace imports.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `PipelineTests` {#symbol-pipelinetests}
- Type: class
- Source: [source](../../../../../../../../../tests/integration/programs/csharp/rosetta/src/App/PipelineTests.cs#L18)

##### `PipelineTests` — Summary
Integration tests for the complete data processing pipeline.

This test file exercises NON-name-matched test detection:
PipelineTests.cs imports Processor and Record/Report, so those files
should appear as "test-backed" in the Explorer even without
a directly name-matched test file.

#### `PipelineIntegration` {#symbol-pipelineintegration}
- Type: class
- Source: [source](../../../../../../../../../tests/integration/programs/csharp/rosetta/src/App/PipelineTests.cs#L20)

#### `ProcessesRecordsThroughCompletePipeline` {#symbol-processesrecordsthroughcompletepipeline}
- Type: method
- Source: [source](../../../../../../../../../tests/integration/programs/csharp/rosetta/src/App/PipelineTests.cs#L23)

#### `ValidatesConfigurationBeforeProcessing` {#symbol-validatesconfigurationbeforeprocessing}
- Type: method
- Source: [source](../../../../../../../../../tests/integration/programs/csharp/rosetta/src/App/PipelineTests.cs#L47)

#### `HandlesEdgeCasesInPipeline` {#symbol-handlesedgecasesinpipeline}
- Type: method
- Source: [source](../../../../../../../../../tests/integration/programs/csharp/rosetta/src/App/PipelineTests.cs#L57)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `Xunit`
- [`Record`](../Models/Record.cs.mdmd.md#symbol-record-class)
- [`Report`](../Models/Report.cs.mdmd.md#symbol-report-class)
- [`Processor`](../Processor/Processor.cs.mdmd.md#symbol-processor)
- [`ProcessorConfig`](../Types/ProcessorConfig.cs.mdmd.md#symbol-processorconfig)
<!-- LIVE-DOC:END Dependencies -->
