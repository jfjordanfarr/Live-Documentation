# tests/integration/programs/cpp/rosetta/src/models.hpp

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/cpp/rosetta/src/models.hpp
- Generated At: 2026-10-16T00:58:49.393Z

## Authored
### Purpose
The domain models: `Record` and `Report` as structs, the `create_record` factory and `validate_config`.

### Notes
- `Report` holds a `std::vector<Record>` where the C variant holds a pointer and a count; the names are the C variant's.
- Written 2026-10-16 as the ninth language of the rosetta parity test, mirroring the C variant file for file so that the canonical edges hold by the same symbols ([Turn 10 of the October 15 session](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-15.1.record.md#turn-10)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ROSETTA_MODELS_HPP` {#symbol-rosetta_models_hpp}
- Type: const
- Source: [source](../../../../../../../../tests/integration/programs/cpp/rosetta/src/models.hpp#L9)

#### `Record` {#symbol-record}
- Type: struct
- Source: [source](../../../../../../../../tests/integration/programs/cpp/rosetta/src/models.hpp#L21)

##### `Record` — Summary
A data record to be processed.

#### `entry` {#symbol-entry}
- Type: field
- Source: [source](../../../../../../../../tests/integration/programs/cpp/rosetta/src/models.hpp#L22)

#### `value` {#symbol-value}
- Type: field
- Source: [source](../../../../../../../../tests/integration/programs/cpp/rosetta/src/models.hpp#L23)

#### `tags` {#symbol-tags}
- Type: field
- Source: [source](../../../../../../../../tests/integration/programs/cpp/rosetta/src/models.hpp#L24)

#### `Report` {#symbol-report}
- Type: struct
- Source: [source](../../../../../../../../tests/integration/programs/cpp/rosetta/src/models.hpp#L30)

##### `Report` — Summary
Summary report produced by the processor.

#### `total` {#symbol-total}
- Type: field
- Source: [source](../../../../../../../../tests/integration/programs/cpp/rosetta/src/models.hpp#L31)

#### `average` {#symbol-average}
- Type: field
- Source: [source](../../../../../../../../tests/integration/programs/cpp/rosetta/src/models.hpp#L32)

#### `records` {#symbol-records}
- Type: field
- Source: [source](../../../../../../../../tests/integration/programs/cpp/rosetta/src/models.hpp#L33)

#### `generated_at` {#symbol-generated_at}
- Type: field
- Source: [source](../../../../../../../../tests/integration/programs/cpp/rosetta/src/models.hpp#L34)

#### `create_record` {#symbol-create_record}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/cpp/rosetta/src/models.hpp#L43)

##### `create_record` — Summary
Factory for creating records with sensible defaults.

##### `create_record` — Parameters
- `id`: Record identifier
- `value`: Numeric value

##### `create_record` — Returns
Initialized record

#### `validate_config` {#symbol-validate_config}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/cpp/rosetta/src/models.hpp#L50)

##### `validate_config` — Summary
Validates configuration is within acceptable bounds.

##### `validate_config` — Parameters
- `config`: Configuration to validate

##### `validate_config` — Returns
true if valid, false otherwise
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `cstdint`
- `string`
- [`types.Entry`](./types.hpp.mdmd.md#symbol-entry)
- [`types.ProcessorConfig`](./types.hpp.mdmd.md#symbol-processorconfig)
- `vector`
<!-- LIVE-DOC:END Dependencies -->
