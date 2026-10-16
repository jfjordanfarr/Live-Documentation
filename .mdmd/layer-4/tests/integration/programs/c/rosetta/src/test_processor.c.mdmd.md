# tests/integration/programs/c/rosetta/src/test_processor.c

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/c/rosetta/src/test_processor.c
- Entry: program [`main`](#symbol-main)
- Generated At: 2026-10-16T00:58:49.216Z

## Authored
### Purpose
Unit tests for the C Rosetta processor module. Part of the polyglot Rosetta Stone fixture suite.

### Notes
Created as part of Goal 2 (Rosetta Tests) during [Dev Day 60](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-16.1.md). Uses manual assertion macros (no standard C test framework). Required fix to cFunctions.ts heuristic to avoid matching function definitions as calls.
- Rewritten against the sample's real API on 2026-10-16: the file had called functions no header declares (`format`, `sum`, `average`, `run`, `summarize`) and `create_record` with the wrong arity since 2026-01-16, which gcc 14 refuses, found when a compilation database was written for scip-clang ([Turn 10 of the October 15 session](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-15.1.record.md#turn-10)). It now compiles, links and passes.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ASSERT` {#symbol-assert}
- Type: const
- Source: [source](../../../../../../../../tests/integration/programs/c/rosetta/src/test_processor.c#L19)

#### `test_run_processor_processes_records_and_fills_report` {#symbol-test_run_processor_processes_records_and_fills_report}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/c/rosetta/src/test_processor.c#L29)

#### `test_run_processor_handles_empty_record_set` {#symbol-test_run_processor_handles_empty_record_set}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/c/rosetta/src/test_processor.c#L48)

#### `test_summarize_report_formats_report` {#symbol-test_summarize_report_formats_report}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/c/rosetta/src/test_processor.c#L61)

#### `main` {#symbol-main}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/c/rosetta/src/test_processor.c#L79)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `math.h`
- `stdio.h`
- `stdlib.h`
- `string.h`
- [`models.Record`](./models.h.mdmd.md#symbol-record)
- [`models.Report`](./models.h.mdmd.md#symbol-report)
- [`models.create_record`](./models.h.mdmd.md#symbol-create_record)
- [`processor.free_report`](./processor.h.mdmd.md#symbol-free_report)
- [`processor.run_processor`](./processor.h.mdmd.md#symbol-run_processor)
- [`processor.summarize_report`](./processor.h.mdmd.md#symbol-summarize_report)
<!-- LIVE-DOC:END Dependencies -->
