# tests/integration/programs/cpp/rosetta/src/test_pipeline.cpp

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/cpp/rosetta/src/test_pipeline.cpp
- Entry: program [`main`](#symbol-main)
- Generated At: 2026-10-16T00:58:49.543Z

## Authored
### Purpose
Integration tests of the whole pipeline, not name-matched to any file, so that the processor and the models are test-backed through it.

### Notes
- Ten checks; includes `types.hpp` for the configuration check, the test-to-types edge.
- Written 2026-10-16 as the ninth language of the rosetta parity test, mirroring the C variant file for file so that the canonical edges hold by the same symbols ([Turn 10 of the October 15 session](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-15.1.record.md#turn-10)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `main` {#symbol-main}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/cpp/rosetta/src/test_pipeline.cpp#L84)
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
- [`models.validate_config`](./models.hpp.mdmd.md#symbol-validate_config)
- [`processor.run_processor`](./processor.hpp.mdmd.md#symbol-run_processor)
- [`processor.summarize_report`](./processor.hpp.mdmd.md#symbol-summarize_report)
- [`types.ProcessorConfig`](./types.hpp.mdmd.md#symbol-processorconfig)
- `vector`
<!-- LIVE-DOC:END Dependencies -->
