# tests/integration/benchmarks/fixtures/csharp/rosetta/src/App/PipelineTests.cs

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/benchmarks/fixtures/csharp/rosetta/src/App/PipelineTests.cs
- Live Doc ID: LD-test-tests-integration-benchmarks-fixtures-csharp-rosetta-src-app-pipelinetests-cs
- Generated At: 2026-02-03T21:55:42.987Z

## Authored
### Purpose
xUnit integration tests for the C# Rosetta data processing pipeline.

### Notes
Created as part of Goal 2 (Rosetta Tests) during [Dev Day 60](../../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-16.1.md). Exercises NON-name-matched test detection through `using Rosetta.Models` and `using Rosetta.Processor` namespace imports.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:42.987Z","inputHash":"dca083a942fc4bf5"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `PipelineTests` {#symbol-pipelinetests}
- Type: class
- Source: [source](../../../../../../../../../../tests/integration/benchmarks/fixtures/csharp/rosetta/src/App/PipelineTests.cs#L17)

##### `PipelineTests` — Summary
Integration tests for the complete data processing pipeline.

This test file exercises NON-name-matched test detection:
PipelineTests.cs imports Processor and Record/Report, so those files
should appear as "test-backed" in the Explorer even without
a directly name-matched test file.

#### `PipelineIntegration` {#symbol-pipelineintegration}
- Type: class
- Source: [source](../../../../../../../../../../tests/integration/benchmarks/fixtures/csharp/rosetta/src/App/PipelineTests.cs#L19)

#### `ProcessesRecordsThroughCompletePipeline` {#symbol-processesrecordsthroughcompletepipeline}
- Type: method
- Source: [source](../../../../../../../../../../tests/integration/benchmarks/fixtures/csharp/rosetta/src/App/PipelineTests.cs#L23)

#### `ValidatesConfigurationBeforeProcessing` {#symbol-validatesconfigurationbeforeprocessing}
- Type: method
- Source: [source](../../../../../../../../../../tests/integration/benchmarks/fixtures/csharp/rosetta/src/App/PipelineTests.cs#L47)

#### `HandlesEdgeCasesInPipeline` {#symbol-handlesedgecasesinpipeline}
- Type: method
- Source: [source](../../../../../../../../../../tests/integration/benchmarks/fixtures/csharp/rosetta/src/App/PipelineTests.cs#L57)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `Rosetta.Models`
- `Rosetta.Processor`
- `Rosetta.Types`
- `Xunit`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
