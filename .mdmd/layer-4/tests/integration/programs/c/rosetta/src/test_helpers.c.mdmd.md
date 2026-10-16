# tests/integration/programs/c/rosetta/src/test_helpers.c

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/c/rosetta/src/test_helpers.c
- Entry: program [`main`](#symbol-main)
- Generated At: 2026-10-16T00:58:49.127Z

## Authored
### Purpose
Unit tests for the C Rosetta helpers module (format, sum, average utilities).

### Notes
Created as part of Goal 2 (Rosetta Tests) during [Dev Day 60](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-16.1.md). Exercises name-matched test detection with C's `#include "helpers.h"` pattern.
- Rewritten against the sample's real API on 2026-10-16: the file had called functions no header declares (`format`, `sum`, `average`, `run`, `summarize`) and `create_record` with the wrong arity since 2026-01-16, which gcc 14 refuses, found when a compilation database was written for scip-clang ([Turn 10 of the October 15 session](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-15.1.record.md#turn-10)). It now compiles, links and passes.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ASSERT` {#symbol-assert}
- Type: const
- Source: [source](../../../../../../../../tests/integration/programs/c/rosetta/src/test_helpers.c#L18)

#### `test_format_value_formats_numbers` {#symbol-test_format_value_formats_numbers}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/c/rosetta/src/test_helpers.c#L28)

#### `test_validate_id_accepts_identifiers` {#symbol-test_validate_id_accepts_identifiers}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/c/rosetta/src/test_helpers.c#L40)

#### `test_sum_values_sums_array` {#symbol-test_sum_values_sums_array}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/c/rosetta/src/test_helpers.c#L48)

#### `test_sum_values_returns_zero_for_empty` {#symbol-test_sum_values_returns_zero_for_empty}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/c/rosetta/src/test_helpers.c#L60)

#### `test_average_values_calculates_average` {#symbol-test_average_values_calculates_average}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/c/rosetta/src/test_helpers.c#L67)

#### `test_average_values_returns_zero_for_empty` {#symbol-test_average_values_returns_zero_for_empty}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/c/rosetta/src/test_helpers.c#L75)

#### `main` {#symbol-main}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/c/rosetta/src/test_helpers.c#L82)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `math.h`
- `stdio.h`
- `stdlib.h`
- `string.h`
- [`helpers.average_values`](./helpers.h.mdmd.md#symbol-average_values)
- [`helpers.format_value`](./helpers.h.mdmd.md#symbol-format_value)
- [`helpers.sum_values`](./helpers.h.mdmd.md#symbol-sum_values)
- [`helpers.validate_id`](./helpers.h.mdmd.md#symbol-validate_id)
<!-- LIVE-DOC:END Dependencies -->
