# tests/integration/programs/cpp/rosetta/src/processor.cpp

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/cpp/rosetta/src/processor.cpp
- Generated At: 2026-10-16T00:58:49.431Z

## Authored
### Purpose
The processor: a small `Processor` class whose `run` the free function `run_processor` calls, plus the summary and the release of a report.

### Notes
- Uses the helpers for sums, averages and formatting, as the C `processor.c` does, so the processor-to-helpers edge holds by the same symbols.
- Written 2026-10-16 as the ninth language of the rosetta parity test, mirroring the C variant file for file so that the canonical edges hold by the same symbols ([Turn 10 of the October 15 session](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-15.1.record.md#turn-10)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Processor` {#symbol-processor}
- Type: constructor
- Source: [source](../../../../../../../../tests/integration/programs/cpp/rosetta/src/processor.cpp#L19)

#### `run` {#symbol-run}
- Type: method
- Source: [source](../../../../../../../../tests/integration/programs/cpp/rosetta/src/processor.cpp#L21)

#### `run_processor` {#symbol-run_processor}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/cpp/rosetta/src/processor.cpp#L42)

#### `summarize_report` {#symbol-summarize_report}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/cpp/rosetta/src/processor.cpp#L47)

#### `free_report` {#symbol-free_report}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/cpp/rosetta/src/processor.cpp#L53)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `ctime`
- [`helpers.average_values`](./helpers.hpp.mdmd.md#symbol-average_values)
- [`helpers.format_value`](./helpers.hpp.mdmd.md#symbol-format_value)
- [`helpers.sum_values`](./helpers.hpp.mdmd.md#symbol-sum_values)
- [`Processor`](./processor.hpp.mdmd.md#symbol-processor-class)
- [`processor.free_report`](./processor.hpp.mdmd.md#symbol-free_report)
- [`processor.run_processor`](./processor.hpp.mdmd.md#symbol-run_processor)
- [`processor.summarize_report`](./processor.hpp.mdmd.md#symbol-summarize_report)
<!-- LIVE-DOC:END Dependencies -->
