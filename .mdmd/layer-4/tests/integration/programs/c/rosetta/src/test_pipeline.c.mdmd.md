# tests/integration/programs/c/rosetta/src/test_pipeline.c

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/c/rosetta/src/test_pipeline.c
- Entry: program [`main`](#symbol-main)
- Generated At: 2026-10-16T00:58:49.178Z

## Authored
### Purpose
Integration tests for the C Rosetta data processing pipeline.

### Notes
Created as part of Goal 2 (Rosetta Tests) during [Dev Day 60](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-16.1.md). Exercises NON-name-matched test detection through `#include` of processor.h, models.h, and types.h headers.
- Rewritten against the sample's real API on 2026-10-16: the file had called functions no header declares (`format`, `sum`, `average`, `run`, `summarize`) and `create_record` with the wrong arity since 2026-01-16, which gcc 14 refuses, found when a compilation database was written for scip-clang ([Turn 10 of the October 15 session](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-15.1.record.md#turn-10)). It now compiles, links and passes.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ASSERT` {#symbol-assert}
- Type: const
- Source: [source](../../../../../../../../tests/integration/programs/c/rosetta/src/test_pipeline.c#L22)

#### `test_processes_records_through_complete_pipeline` {#symbol-test_processes_records_through_complete_pipeline}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/c/rosetta/src/test_pipeline.c#L32)

#### `test_validates_configuration_before_processing` {#symbol-test_validates_configuration_before_processing}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/c/rosetta/src/test_pipeline.c#L59)

#### `test_handles_edge_cases_in_pipeline` {#symbol-test_handles_edge_cases_in_pipeline}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/c/rosetta/src/test_pipeline.c#L69)

#### `main` {#symbol-main}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/c/rosetta/src/test_pipeline.c#L87)
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
- [`models.validate_config`](./models.h.mdmd.md#symbol-validate_config)
- [`processor.free_report`](./processor.h.mdmd.md#symbol-free_report)
- [`processor.run_processor`](./processor.h.mdmd.md#symbol-run_processor)
- [`processor.summarize_report`](./processor.h.mdmd.md#symbol-summarize_report)
- [`types.ProcessorConfig`](./types.h.mdmd.md#symbol-processorconfig)
<!-- LIVE-DOC:END Dependencies -->
