# tests/integration/programs/c/rosetta/src/main.c

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/c/rosetta/src/main.c
- Live Doc ID: LD-test-tests-integration-programs-c-rosetta-src-main-c
- Generated At: 2026-09-27T18:53:05.111Z

## Authored
### Purpose
Entry point for the C Rosetta Stone fixture. Demonstrates #include and function call patterns.

### Notes
See [2026-01-14.1.md](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-14.1.md). Tests C include directive and cross-file call detection.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T18:53:05.111Z","inputHash":"78e079866c99cc7d"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `rosetta_main` {#symbol-rosetta_main}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/c/rosetta/src/main.c#L19)

##### `rosetta_main` — Summary
Executes the Rosetta data pipeline.

##### `rosetta_main` — Parameters
- `seed`: Starting seed value for generating records

##### `rosetta_main` — Returns
Pointer to summary string (caller must free)

#### `main` {#symbol-main}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/c/rosetta/src/main.c#L42)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `stdio.h`
- `stdlib.h`
- [`models.Record`](./models.h.mdmd.md#symbol-record)
- [`models.Report`](./models.h.mdmd.md#symbol-report)
- [`models.create_record`](./models.h.mdmd.md#symbol-create_record)
- [`processor.free_report`](./processor.h.mdmd.md#symbol-free_report)
- [`processor.run_processor`](./processor.h.mdmd.md#symbol-run_processor)
- [`processor.summarize_report`](./processor.h.mdmd.md#symbol-summarize_report)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
