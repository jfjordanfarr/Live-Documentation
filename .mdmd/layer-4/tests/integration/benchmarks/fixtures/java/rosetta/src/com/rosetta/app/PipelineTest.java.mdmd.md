# tests/integration/benchmarks/fixtures/java/rosetta/src/com/rosetta/app/PipelineTest.java

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/benchmarks/fixtures/java/rosetta/src/com/rosetta/app/PipelineTest.java
- Live Doc ID: LD-implementation-tests-integration-benchmarks-fixtures-java-rosetta-src-com-rosetta-app-pipelinetest-java
- Generated At: 2026-01-16T19:17:00.090Z

## Authored
### Purpose
JUnit 5 integration tests for the Java Rosetta data processing pipeline.

### Notes
Created as part of Goal 2 (Rosetta Tests) during [Dev Day 60](../../../../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-16.1.md). Exercises NON-name-matched test detection through imports of `com.rosetta.processor.Processor` and `com.rosetta.models.Record/Report`.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-16T19:17:00.090Z","inputHash":"11accd9ee6904c87"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `PipelineTest` {#symbol-pipelinetest}
- Type: class
- Source: [source](../../../../../../../../../../../../tests/integration/benchmarks/fixtures/java/rosetta/src/com/rosetta/app/PipelineTest.java#L25)

##### `PipelineTest` — Summary
Integration tests for the complete data processing pipeline.

##### `PipelineTest` — Remarks
This test file exercises NON-name-matched test detection:
PipelineTest.java imports Processor and Record/Report, so those files
should appear as "test-backed" in the Explorer even without
a directly name-matched test file.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `org.junit.jupiter.api.Assertions.*`
- `org.junit.jupiter.api.DisplayName` - `DisplayName`
- `org.junit.jupiter.api.Nested` - `Nested`
- `org.junit.jupiter.api.Test` - `Test`
- [`Record`](../models/Record.java.mdmd.md#symbol-record-class)
- [`Report`](../models/Report.java.mdmd.md#symbol-report-class)
- [`Processor`](../processor/Processor.java.mdmd.md#symbol-processor)
- [`ProcessorConfig`](../types/ProcessorConfig.java.mdmd.md#symbol-processorconfig-class)
<!-- LIVE-DOC:END Dependencies -->
