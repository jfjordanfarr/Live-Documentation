# tests/integration/benchmarks/fixtures/c/rosetta/src/test_pipeline.c

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/benchmarks/fixtures/c/rosetta/src/test_pipeline.c
- Live Doc ID: LD-test-tests-integration-benchmarks-fixtures-c-rosetta-src-test-pipeline-c
- Generated At: 2026-01-16T21:21:09.651Z

## Authored
### Purpose
Integration tests for the C Rosetta data processing pipeline.

### Notes
Created as part of Goal 2 (Rosetta Tests) during [Dev Day 60](../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-16.1.md). Exercises NON-name-matched test detection through `#include` of processor.h, models.h, and types.h headers.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-16T21:21:09.651Z","inputHash":"d24b08c2a01aa7eb"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ASSERT` {#symbol-assert}
- Type: const
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/c/rosetta/src/test_pipeline.c#L22)

#### `test_processes_records_through_complete_pipeline` {#symbol-test_processes_records_through_complete_pipeline}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/c/rosetta/src/test_pipeline.c#L32)

#### `test_validates_configuration_before_processing` {#symbol-test_validates_configuration_before_processing}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/c/rosetta/src/test_pipeline.c#L55)

#### `test_handles_edge_cases_in_pipeline` {#symbol-test_handles_edge_cases_in_pipeline}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/c/rosetta/src/test_pipeline.c#L65)

#### `main` {#symbol-main}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/c/rosetta/src/test_pipeline.c#L79)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `math.h`
- `stdio.h`
- `stdlib.h`
- `string.h`
- [`models.create_record`](./models.h.mdmd.md#symbol-create_record)
- [`models.validate_config`](./models.h.mdmd.md#symbol-validate_config)
- [`processor`](./processor.h.mdmd.md)
- [`types`](./types.h.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
