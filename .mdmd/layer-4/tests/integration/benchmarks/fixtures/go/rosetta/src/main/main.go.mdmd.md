# tests/integration/benchmarks/fixtures/go/rosetta/src/main/main.go

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/benchmarks/fixtures/go/rosetta/src/main/main.go
- Live Doc ID: LD-implementation-tests-integration-benchmarks-fixtures-go-rosetta-src-main-main-go
- Generated At: 2026-01-15T18:20:23.036Z

## Authored
### Purpose
Entry point for the Go Rosetta Stone benchmark fixture, demonstrating Go's package import patterns and function call chains.

### Notes
- Part of the cross-language Rosetta Stone benchmark suite; implements the canonical `main → processor → models/helpers → types` pipeline.
- Created 2026-01-15 as part of the Go adapter commit; see [2026-01-15.1.md](../../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-15.1.md) for implementation context and goFixtureOracle.ts for ground truth generation.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-15T18:20:23.036Z","inputHash":"46cf6da61e8d6727"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Main` {#symbol-main}
- Type: function
- Source: [source](../../../../../../../../../../tests/integration/benchmarks/fixtures/go/rosetta/src/main/main.go#L17)

##### `Main` — Summary
Main executes the Rosetta data pipeline. Creates test records using the factory, processes them, and returns a formatted summary.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`models.CreateRecord`](../models/models.go.mdmd.md#symbol-createrecord)
- [`models.Record`](../models/models.go.mdmd.md#symbol-record)
- [`processor.Run`](../processor/processor.go.mdmd.md#symbol-run)
- [`processor.Summarize`](../processor/processor.go.mdmd.md#symbol-summarize)
<!-- LIVE-DOC:END Dependencies -->
