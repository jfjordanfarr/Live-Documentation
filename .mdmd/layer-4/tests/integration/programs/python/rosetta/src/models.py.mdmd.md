# tests/integration/programs/python/rosetta/src/models.py

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/python/rosetta/src/models.py
- Generated At: 2026-10-02T20:20:07.902Z

## Authored
### Purpose
Data models for the Python Rosetta Stone fixture. Defines Record and Report dataclasses.

### Notes
See [2026-01-14.1.md](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-14.1.md). Multi-consumer module imported by main.py and processor.py.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Record` {#symbol-record}
- Type: class
- Source: [source](../../../../../../../../tests/integration/programs/python/rosetta/src/models.py#L15)
- Extends: [`Entry`](./core_types.py.mdmd.md#symbol-entry)

##### `Record` — Summary
A data record to be processed.

#### `value` {#symbol-value}
- Type: field
- Source: [source](../../../../../../../../tests/integration/programs/python/rosetta/src/models.py#L17)

#### `tags` {#symbol-tags}
- Type: field
- Source: [source](../../../../../../../../tests/integration/programs/python/rosetta/src/models.py#L18)

#### `Report` {#symbol-report}
- Type: class
- Source: [source](../../../../../../../../tests/integration/programs/python/rosetta/src/models.py#L22)

##### `Report` — Summary
Summary report produced by the processor.

#### `total` {#symbol-total}
- Type: field
- Source: [source](../../../../../../../../tests/integration/programs/python/rosetta/src/models.py#L24)

#### `average` {#symbol-average}
- Type: field
- Source: [source](../../../../../../../../tests/integration/programs/python/rosetta/src/models.py#L25)

#### `records` {#symbol-records}
- Type: field
- Source: [source](../../../../../../../../tests/integration/programs/python/rosetta/src/models.py#L26)

#### `generated_at` {#symbol-generated_at}
- Type: field
- Source: [source](../../../../../../../../tests/integration/programs/python/rosetta/src/models.py#L27)

#### `create_record` {#symbol-create_record}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/python/rosetta/src/models.py#L30)
- Returns: [`Record`](#symbol-record)

##### `create_record` — Summary
Factory for creating records with sensible defaults.

#### `validate_config` {#symbol-validate_config}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/python/rosetta/src/models.py#L41)
- Parameters: `config`: [`ProcessorConfig`](./core_types.py.mdmd.md#symbol-processorconfig)

##### `validate_config` — Summary
Validates configuration is within acceptable bounds.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `dataclasses` - `dataclass`, `field`
- `datetime` - `datetime`
- [`core_types.Entry`](./core_types.py.mdmd.md#symbol-entry)
- [`core_types.ProcessorConfig`](./core_types.py.mdmd.md#symbol-processorconfig)
- [`core_types.Status`](./core_types.py.mdmd.md#symbol-status-class)
- `typing` - `List`
<!-- LIVE-DOC:END Dependencies -->
