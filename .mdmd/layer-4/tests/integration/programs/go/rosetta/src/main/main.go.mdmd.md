# tests/integration/programs/go/rosetta/src/main/main.go

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/go/rosetta/src/main/main.go
- Generated At: 2026-10-02T20:20:06.046Z

## Authored
### Purpose
Entry point for the Go Rosetta Stone benchmark fixture, demonstrating Go's package import patterns and function call chains.

### Notes
- Part of the cross-language Rosetta Stone benchmark suite; implements the canonical `main → processor → models/helpers → types` pipeline.
- Created 2026-01-15 as part of the Go adapter commit; see [2026-01-15.1.md](../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-15.1.md) for implementation context and goFixtureOracle.ts for ground truth generation.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Main (function overload 1)` {#symbol-main-function-overload-1}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/programs/go/rosetta/src/main/main.go#L17)

##### `Main (function overload 1)` — Summary
Main executes the Rosetta data pipeline.

##### `Main (function overload 1)` — Remarks
Creates test records using the factory, processes them,
and returns a formatted summary.

#### `main (function overload 2)` {#symbol-main-function-overload-2}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/programs/go/rosetta/src/main/main.go#L32)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`models.CreateRecord`](../models/models.go.mdmd.md#symbol-createrecord)
- [`models.Record`](../models/models.go.mdmd.md#symbol-record)
- [`processor.Run`](../processor/processor.go.mdmd.md#symbol-run)
- [`processor.Summarize`](../processor/processor.go.mdmd.md#symbol-summarize)
<!-- LIVE-DOC:END Dependencies -->
