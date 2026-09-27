# tests/integration/programs/python/rosetta/src/core_types.py

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/python/rosetta/src/core_types.py
- Live Doc ID: LD-test-tests-integration-programs-python-rosetta-src-core-types-py
- Generated At: 2026-09-27T21:43:46.901Z

## Authored
### Purpose
Type definitions for the Python Rosetta Stone fixture using TypedDict.

### Notes
See [2026-01-14.1.md](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-14.1.md). Named core_types.py (not types.py) to avoid Python stdlib collision.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T21:43:46.901Z","inputHash":"a67fd6510cdd1a5b"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Status (class)` {#symbol-status-class}
- Type: class
- Source: [source](../../../../../../../../tests/integration/programs/python/rosetta/src/core_types.py#L14)
- Extends: `Enum`

##### `Status (class)` — Summary
Status enumeration for records.

#### `PENDING` {#symbol-pending}
- Type: field
- Source: [source](../../../../../../../../tests/integration/programs/python/rosetta/src/core_types.py#L16)

#### `ACTIVE` {#symbol-active}
- Type: field
- Source: [source](../../../../../../../../tests/integration/programs/python/rosetta/src/core_types.py#L17)

#### `COMPLETE` {#symbol-complete}
- Type: field
- Source: [source](../../../../../../../../tests/integration/programs/python/rosetta/src/core_types.py#L18)

#### `Entry` {#symbol-entry}
- Type: class
- Source: [source](../../../../../../../../tests/integration/programs/python/rosetta/src/core_types.py#L22)

##### `Entry` — Summary
A timestamped entry in the data pipeline.

#### `id` {#symbol-id}
- Type: field
- Source: [source](../../../../../../../../tests/integration/programs/python/rosetta/src/core_types.py#L24)

#### `timestamp` {#symbol-timestamp}
- Type: field
- Source: [source](../../../../../../../../tests/integration/programs/python/rosetta/src/core_types.py#L25)

#### `status (field)` {#symbol-status-field}
- Type: field
- Source: [source](../../../../../../../../tests/integration/programs/python/rosetta/src/core_types.py#L26)

#### `ProcessorConfig` {#symbol-processorconfig}
- Type: class
- Source: [source](../../../../../../../../tests/integration/programs/python/rosetta/src/core_types.py#L30)

##### `ProcessorConfig` — Summary
Configuration for processing operations.

#### `batch_size` {#symbol-batch_size}
- Type: field
- Source: [source](../../../../../../../../tests/integration/programs/python/rosetta/src/core_types.py#L32)

#### `timeout` {#symbol-timeout}
- Type: field
- Source: [source](../../../../../../../../tests/integration/programs/python/rosetta/src/core_types.py#L33)

#### `strict` {#symbol-strict}
- Type: field
- Source: [source](../../../../../../../../tests/integration/programs/python/rosetta/src/core_types.py#L34)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `dataclasses` - `dataclass`
- `datetime` - `datetime`
- `enum` - `Enum`
- `typing` - `List`
<!-- LIVE-DOC:END Dependencies -->
