# tests/integration/programs/cpp/rosetta/src/types.hpp

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/cpp/rosetta/src/types.hpp
- Generated At: 2026-10-16T00:58:49.596Z

## Authored
### Purpose
The shared types: `Status` as an enum class, `Entry` and `ProcessorConfig`; a foundation with no dependency of its own.

### Notes
- A leaf, as the parity test requires of `types` in every language.
- Written 2026-10-16 as the ninth language of the rosetta parity test, mirroring the C variant file for file so that the canonical edges hold by the same symbols ([Turn 10 of the October 15 session](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-15.1.record.md#turn-10)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ROSETTA_TYPES_HPP` {#symbol-rosetta_types_hpp}
- Type: const
- Source: [source](../../../../../../../../tests/integration/programs/cpp/rosetta/src/types.hpp#L10)

#### `Status (enum)` {#symbol-status-enum}
- Type: enum
- Source: [source](../../../../../../../../tests/integration/programs/cpp/rosetta/src/types.hpp#L20)

##### `Status (enum)` — Summary
Status enumeration for records.

#### `Entry` {#symbol-entry}
- Type: struct
- Source: [source](../../../../../../../../tests/integration/programs/cpp/rosetta/src/types.hpp#L29)

##### `Entry` — Summary
A timestamped entry in the data pipeline.

#### `id` {#symbol-id}
- Type: field
- Source: [source](../../../../../../../../tests/integration/programs/cpp/rosetta/src/types.hpp#L30)

#### `timestamp` {#symbol-timestamp}
- Type: field
- Source: [source](../../../../../../../../tests/integration/programs/cpp/rosetta/src/types.hpp#L31)

#### `status (field)` {#symbol-status-field}
- Type: field
- Source: [source](../../../../../../../../tests/integration/programs/cpp/rosetta/src/types.hpp#L32)

#### `ProcessorConfig` {#symbol-processorconfig}
- Type: struct
- Source: [source](../../../../../../../../tests/integration/programs/cpp/rosetta/src/types.hpp#L38)

##### `ProcessorConfig` — Summary
Configuration for processing operations.

#### `batch_size` {#symbol-batch_size}
- Type: field
- Source: [source](../../../../../../../../tests/integration/programs/cpp/rosetta/src/types.hpp#L39)

#### `timeout` {#symbol-timeout}
- Type: field
- Source: [source](../../../../../../../../tests/integration/programs/cpp/rosetta/src/types.hpp#L40)

#### `strict` {#symbol-strict}
- Type: field
- Source: [source](../../../../../../../../tests/integration/programs/cpp/rosetta/src/types.hpp#L41)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `cstdint`
- `string`
<!-- LIVE-DOC:END Dependencies -->
