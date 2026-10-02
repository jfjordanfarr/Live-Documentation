# tests/integration/programs/c/rosetta/src/models.h

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/c/rosetta/src/models.h
- Generated At: 2026-10-02T20:20:04.417Z

## Authored
### Purpose
C Rosetta Stone fixture source/header file. Part of the cross-language benchmark suite.

### Notes
See [2026-01-14.1.md](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-14.1.md). Tests C #include and function call graph detection.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ROSETTA_MODELS_H` {#symbol-rosetta_models_h}
- Type: const
- Source: [source](../../../../../../../../tests/integration/programs/c/rosetta/src/models.h#L9)

#### `Record` {#symbol-record}
- Type: struct
- Source: [source](../../../../../../../../tests/integration/programs/c/rosetta/src/models.h#L17)

##### `Record` — Summary
A data record to be processed.

#### `Report` {#symbol-report}
- Type: struct
- Source: [source](../../../../../../../../tests/integration/programs/c/rosetta/src/models.h#L27)

##### `Report` — Summary
Summary report produced by the processor.

#### `create_record` {#symbol-create_record}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/c/rosetta/src/models.h#L41)

##### `create_record` — Summary
Factory for creating records with sensible defaults.

##### `create_record` — Parameters
- `id`: Record identifier
- `value`: Numeric value

##### `create_record` — Returns
Initialized record

#### `validate_config` {#symbol-validate_config}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/c/rosetta/src/models.h#L48)

##### `validate_config` — Summary
Validates configuration is within acceptable bounds.

##### `validate_config` — Parameters
- `config`: Configuration to validate

##### `validate_config` — Returns
true if valid, false otherwise
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `stddef.h`
- [`types.Entry`](./types.h.mdmd.md#symbol-entry)
- [`types.ProcessorConfig`](./types.h.mdmd.md#symbol-processorconfig)
<!-- LIVE-DOC:END Dependencies -->
