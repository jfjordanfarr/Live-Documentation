# tests/integration/programs/cpp/rosetta/src/processor.hpp

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/cpp/rosetta/src/processor.hpp
- Generated At: 2026-10-16T00:58:49.468Z

## Authored
### Purpose
The processor's interface: `run_processor`, `summarize_report` and `free_report` as free functions in `namespace rosetta`, over the models and the shared types.

### Notes
- Declares the free functions the C variant has by the same names; the `Processor` class behind them is in `processor.cpp`.
- Written 2026-10-16 as the ninth language of the rosetta parity test, mirroring the C variant file for file so that the canonical edges hold by the same symbols ([Turn 10 of the October 15 session](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-15.1.record.md#turn-10)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ROSETTA_PROCESSOR_HPP` {#symbol-rosetta_processor_hpp}
- Type: const
- Source: [source](../../../../../../../../tests/integration/programs/cpp/rosetta/src/processor.hpp#L11)

#### `Processor (class)` {#symbol-processor-class}
- Type: class
- Source: [source](../../../../../../../../tests/integration/programs/cpp/rosetta/src/processor.hpp#L24)

##### `Processor (class)` — Summary
Processes batches of records under one configuration.

#### `Processor (constructor)` {#symbol-processor-constructor}
- Type: constructor
- Source: [source](../../../../../../../../tests/integration/programs/cpp/rosetta/src/processor.hpp#L30)

##### `Processor (constructor)` — Summary
Creates a processor with the given configuration.

##### `Processor (constructor)` — Parameters
- `config`: Processing configuration

#### `run` {#symbol-run}
- Type: method
- Source: [source](../../../../../../../../tests/integration/programs/cpp/rosetta/src/processor.hpp#L37)

##### `run` — Summary
Processes a batch of records and generates a report.

##### `run` — Parameters
- `records`: Records to process

##### `run` — Returns
The report, or nothing when the configuration is invalid

#### `run_processor` {#symbol-run_processor}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/cpp/rosetta/src/processor.hpp#L50)

##### `run_processor` — Summary
Processes a batch of records and generates a report.

##### `run_processor` — Parameters
- `records`: Records to process
- `config`: Processing configuration (may be nullptr for defaults)

##### `run_processor` — Returns
The report, or nothing when the configuration is invalid

#### `summarize_report` {#symbol-summarize_report}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/cpp/rosetta/src/processor.hpp#L58)

##### `summarize_report` — Summary
Creates a formatted summary string from a report.

##### `summarize_report` — Parameters
- `report`: Report to summarize

##### `summarize_report` — Returns
The summary line

#### `free_report` {#symbol-free_report}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/cpp/rosetta/src/processor.hpp#L64)

##### `free_report` — Summary
Releases the records held by a report.

##### `free_report` — Parameters
- `report`: Report to free
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `optional`
- `string`
- [`models.Record`](./models.hpp.mdmd.md#symbol-record)
- [`models.Report`](./models.hpp.mdmd.md#symbol-report)
- [`types.ProcessorConfig`](./types.hpp.mdmd.md#symbol-processorconfig)
- `vector`
<!-- LIVE-DOC:END Dependencies -->
