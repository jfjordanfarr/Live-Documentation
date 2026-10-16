# tests/integration/programs/cpp/rosetta/src/models.cpp

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/cpp/rosetta/src/models.cpp
- Generated At: 2026-10-16T00:58:49.366Z

## Authored
### Purpose
The models' definitions: the record factory and the configuration check.

### Notes
- Depends on `types.hpp` for `Entry`, `Status` and `ProcessorConfig`, the models-to-types edge.
- Written 2026-10-16 as the ninth language of the rosetta parity test, mirroring the C variant file for file so that the canonical edges hold by the same symbols ([Turn 10 of the October 15 session](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-15.1.record.md#turn-10)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `create_record` {#symbol-create_record}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/cpp/rosetta/src/models.cpp#L11)

#### `validate_config` {#symbol-validate_config}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/cpp/rosetta/src/models.cpp#L20)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `ctime`
- [`models.Record`](./models.hpp.mdmd.md#symbol-record)
- [`models.create_record`](./models.hpp.mdmd.md#symbol-create_record)
- [`models.validate_config`](./models.hpp.mdmd.md#symbol-validate_config)
<!-- LIVE-DOC:END Dependencies -->
