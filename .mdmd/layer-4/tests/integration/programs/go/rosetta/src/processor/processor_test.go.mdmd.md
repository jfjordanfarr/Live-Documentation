# tests/integration/programs/go/rosetta/src/processor/processor_test.go

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/go/rosetta/src/processor/processor_test.go
- Generated At: 2026-09-27T23:21:36.068Z

## Authored
### Purpose
Unit tests for the Go Rosetta processor package. Part of the polyglot Rosetta Stone fixture suite.

### Notes
Created as part of Goal 2 (Rosetta Tests) during [Dev Day 60](../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-16.1.md). Uses Go's idiomatic `_test.go` suffix in the same package. Required fix to go.ts heuristic to not skip test files in `appliesTo`.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `TestRun` {#symbol-testrun}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/programs/go/rosetta/src/processor/processor_test.go#L12)
- Parameters: `t`: `T`

#### `TestSummarize` {#symbol-testsummarize}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/programs/go/rosetta/src/processor/processor_test.go#L45)
- Parameters: `t`: `T`
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`models.CreateRecord`](../models/models.go.mdmd.md#symbol-createrecord)
- [`models.Record`](../models/models.go.mdmd.md#symbol-record)
- [`models.Report`](../models/models.go.mdmd.md#symbol-report)
- [`processor.Run`](./processor.go.mdmd.md#symbol-run)
- [`processor.Summarize`](./processor.go.mdmd.md#symbol-summarize)
<!-- LIVE-DOC:END Dependencies -->
