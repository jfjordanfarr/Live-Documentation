# tests/integration/benchmarks/fixtures/c/rosetta/src/test_processor.c

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/benchmarks/fixtures/c/rosetta/src/test_processor.c
- Live Doc ID: LD-test-tests-integration-benchmarks-fixtures-c-rosetta-src-test-processor-c
- Generated At: 2026-02-03T21:55:42.723Z

## Authored
### Purpose
Unit tests for the C Rosetta processor module. Part of the polyglot Rosetta Stone fixture suite.

### Notes
Created as part of Goal 2 (Rosetta Tests) during [Dev Day 60](../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-16.1.md). Uses manual assertion macros (no standard C test framework). Required fix to cFunctions.ts heuristic to avoid matching function definitions as calls.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:42.723Z","inputHash":"5bde852d5c38cc09"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ASSERT` {#symbol-assert}
- Type: const
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/c/rosetta/src/test_processor.c#L19)

#### `test_run_processes_records_and_returns_report` {#symbol-test_run_processes_records_and_returns_report}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/c/rosetta/src/test_processor.c#L29)

#### `test_run_handles_empty_record_set` {#symbol-test_run_handles_empty_record_set}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/c/rosetta/src/test_processor.c#L44)

#### `test_summarize_formats_report` {#symbol-test_summarize_formats_report}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/c/rosetta/src/test_processor.c#L53)

#### `main` {#symbol-main}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/c/rosetta/src/test_processor.c#L69)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `math.h`
- `stdio.h`
- `stdlib.h`
- `string.h`
- [`models.create_record`](./models.h.mdmd.md#symbol-create_record)
- [`processor`](./processor.h.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
