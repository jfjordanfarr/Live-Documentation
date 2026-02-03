# tests/integration/benchmarks/fixtures/c/rosetta/src/processor.h

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/benchmarks/fixtures/c/rosetta/src/processor.h
- Live Doc ID: LD-implementation-tests-integration-benchmarks-fixtures-c-rosetta-src-processor-h
- Generated At: 2026-02-03T21:55:42.637Z

## Authored
### Purpose
C Rosetta Stone fixture source/header file. Part of the cross-language benchmark suite.

### Notes
See [2026-01-14.1.md](../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-14.1.md). Tests C #include and function call graph detection.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:42.637Z","inputHash":"fcaeb6409e52d5d6"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ROSETTA_PROCESSOR_H` {#symbol-rosetta_processor_h}
- Type: const
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/c/rosetta/src/processor.h#L11)

#### `summarize_report` {#symbol-summarize_report}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/c/rosetta/src/processor.h#L40)

##### `summarize_report` — Summary
Creates a formatted summary string from a report.

##### `summarize_report` — Parameters
- `report`: Report to summarize
- `buffer`: Output buffer
- `size`: Buffer size

##### `summarize_report` — Returns
Number of characters written

#### `free_report` {#symbol-free_report}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/c/rosetta/src/processor.h#L46)

##### `free_report` — Summary
Frees resources allocated by a report.

##### `free_report` — Parameters
- `report`: Report to free
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`models`](./models.h.mdmd.md)
- [`types`](./types.h.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->
