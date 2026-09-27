# tests/integration/programs/go/rosetta/src/main/pipeline_test.go

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/go/rosetta/src/main/pipeline_test.go
- Live Doc ID: LD-test-tests-integration-programs-go-rosetta-src-main-pipeline-test-go
- Generated At: 2026-09-27T21:43:45.043Z

## Authored
### Purpose
Integration tests for the Go Rosetta data processing pipeline.

### Notes
Created as part of Goal 2 (Rosetta Tests) during [Dev Day 60](../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-16.1.md). Exercises NON-name-matched test detection through imports of `rosetta/src/processor` and `rosetta/src/models` packages.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T21:43:45.043Z","inputHash":"86bbbda8a92aab5c"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `TestPipelineIntegration` {#symbol-testpipelineintegration}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/programs/go/rosetta/src/main/pipeline_test.go#L17)
- Parameters: `t`: `T`
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`models.CreateRecord`](../models/models.go.mdmd.md#symbol-createrecord)
- [`models.Record`](../models/models.go.mdmd.md#symbol-record)
- [`models.ValidateConfig`](../models/models.go.mdmd.md#symbol-validateconfig)
- [`processor.Run`](../processor/processor.go.mdmd.md#symbol-run)
- [`processor.Summarize`](../processor/processor.go.mdmd.md#symbol-summarize)
- [`types.ProcessorConfig`](../types/types.go.mdmd.md#symbol-processorconfig)
<!-- LIVE-DOC:END Dependencies -->
