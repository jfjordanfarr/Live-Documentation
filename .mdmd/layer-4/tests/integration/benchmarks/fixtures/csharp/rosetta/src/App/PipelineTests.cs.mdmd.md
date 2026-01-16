# tests/integration/benchmarks/fixtures/csharp/rosetta/src/App/PipelineTests.cs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/benchmarks/fixtures/csharp/rosetta/src/App/PipelineTests.cs
- Live Doc ID: LD-implementation-tests-integration-benchmarks-fixtures-csharp-rosetta-src-app-pipelinetests-cs
- Generated At: 2026-01-16T19:17:00.052Z

## Authored
### Purpose
xUnit integration tests for the C# Rosetta data processing pipeline.

### Notes
Created as part of Goal 2 (Rosetta Tests) during [Dev Day 60](../../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-16.1.md). Exercises NON-name-matched test detection through `using Rosetta.Models` and `using Rosetta.Processor` namespace imports.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-16T19:17:00.052Z","inputHash":"10fe7834f139f6cb"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `PipelineTests` {#symbol-pipelinetests}
- Type: class
- Source: [source](../../../../../../../../../../tests/integration/benchmarks/fixtures/csharp/rosetta/src/App/PipelineTests.cs#L16)

##### `PipelineTests` — Summary
Integration tests for the complete data processing pipeline.

This test file exercises NON-name-matched test detection:
PipelineTests.cs imports Processor and Record/Report, so those files
should appear as "test-backed" in the Explorer even without
a directly name-matched test file.

#### `PipelineIntegration` {#symbol-pipelineintegration}
- Type: class
- Source: [source](../../../../../../../../../../tests/integration/benchmarks/fixtures/csharp/rosetta/src/App/PipelineTests.cs#L18)

#### `ProcessesRecordsThroughCompletePipeline` {#symbol-processesrecordsthroughcompletepipeline}
- Type: method
- Source: [source](../../../../../../../../../../tests/integration/benchmarks/fixtures/csharp/rosetta/src/App/PipelineTests.cs#L22)

#### `ValidatesConfigurationBeforeProcessing` {#symbol-validatesconfigurationbeforeprocessing}
- Type: method
- Source: [source](../../../../../../../../../../tests/integration/benchmarks/fixtures/csharp/rosetta/src/App/PipelineTests.cs#L46)

#### `HandlesEdgeCasesInPipeline` {#symbol-handlesedgecasesinpipeline}
- Type: method
- Source: [source](../../../../../../../../../../tests/integration/benchmarks/fixtures/csharp/rosetta/src/App/PipelineTests.cs#L56)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `Rosetta.Models`
- `Rosetta.Processor`
- `Rosetta.Types`
- `Xunit`
<!-- LIVE-DOC:END Dependencies -->
