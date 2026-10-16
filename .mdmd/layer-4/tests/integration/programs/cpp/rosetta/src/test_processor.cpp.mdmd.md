# tests/integration/programs/cpp/rosetta/src/test_processor.cpp

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/cpp/rosetta/src/test_processor.cpp
- Entry: program [`main`](#symbol-main)
- Generated At: 2026-10-16T00:58:49.580Z

## Authored
### Purpose
Unit tests of the processor, name-matched to `processor.cpp`; depends on the models too.

### Notes
- Eleven checks over a run, an empty run and a summary.
- Written 2026-10-16 as the ninth language of the rosetta parity test, mirroring the C variant file for file so that the canonical edges hold by the same symbols ([Turn 10 of the October 15 session](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-15.1.record.md#turn-10)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `main` {#symbol-main}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/cpp/rosetta/src/test_processor.cpp#L87)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `cmath`
- `cstdio`
- `optional`
- `string`
- [`models.Record`](./models.hpp.mdmd.md#symbol-record)
- [`models.Report`](./models.hpp.mdmd.md#symbol-report)
- [`models.create_record`](./models.hpp.mdmd.md#symbol-create_record)
- [`processor.free_report`](./processor.hpp.mdmd.md#symbol-free_report)
- [`processor.run_processor`](./processor.hpp.mdmd.md#symbol-run_processor)
- [`processor.summarize_report`](./processor.hpp.mdmd.md#symbol-summarize_report)
- `vector`
<!-- LIVE-DOC:END Dependencies -->
