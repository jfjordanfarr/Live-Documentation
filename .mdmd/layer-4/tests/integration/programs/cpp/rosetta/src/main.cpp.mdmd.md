# tests/integration/programs/cpp/rosetta/src/main.cpp

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/cpp/rosetta/src/main.cpp
- Entry: program [`main`](#symbol-main)
- Generated At: 2026-10-16T00:58:49.340Z

## Authored
### Purpose
Entry point of the C++ rosetta variant: builds three records, runs the processor and prints the summary; the root of the dependency graph.

### Notes
- Includes `models.hpp` and `processor.hpp` as the C `main.c` does; `main` is the program entry.
- Written 2026-10-16 as the ninth language of the rosetta parity test, mirroring the C variant file for file so that the canonical edges hold by the same symbols ([Turn 10 of the October 15 session](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-15.1.record.md#turn-10)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `rosetta_main` {#symbol-rosetta_main}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/cpp/rosetta/src/main.cpp#L23)

##### `rosetta_main` — Summary
Executes the Rosetta data pipeline.

##### `rosetta_main` — Parameters
- `seed`: Starting seed value for generating records

##### `rosetta_main` — Returns
The summary line, empty when processing failed

#### `main` {#symbol-main}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/cpp/rosetta/src/main.cpp#L45)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
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
