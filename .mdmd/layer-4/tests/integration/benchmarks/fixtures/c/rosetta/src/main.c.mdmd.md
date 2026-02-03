# tests/integration/benchmarks/fixtures/c/rosetta/src/main.c

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/benchmarks/fixtures/c/rosetta/src/main.c
- Live Doc ID: LD-implementation-tests-integration-benchmarks-fixtures-c-rosetta-src-main-c
- Generated At: 2026-02-03T21:55:42.536Z

## Authored
### Purpose
Entry point for the C Rosetta Stone fixture. Demonstrates #include and function call patterns.

### Notes
See [2026-01-14.1.md](../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-14.1.md). Tests C include directive and cross-file call detection.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:42.536Z","inputHash":"21c30738df48f8cd"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `rosetta_main` {#symbol-rosetta_main}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/c/rosetta/src/main.c#L19)

##### `rosetta_main` — Summary
Executes the Rosetta data pipeline.

##### `rosetta_main` — Parameters
- `seed`: Starting seed value for generating records

##### `rosetta_main` — Returns
Pointer to summary string (caller must free)

#### `main` {#symbol-main}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/c/rosetta/src/main.c#L42)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `stdio.h`
- `stdlib.h`
- [`models.create_record`](./models.h.mdmd.md#symbol-create_record)
- [`processor.free_report`](./processor.h.mdmd.md#symbol-free_report)
- [`processor.summarize_report`](./processor.h.mdmd.md#symbol-summarize_report)
<!-- LIVE-DOC:END Dependencies -->
