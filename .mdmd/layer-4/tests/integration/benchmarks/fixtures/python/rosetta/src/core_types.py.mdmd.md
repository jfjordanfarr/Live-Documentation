# tests/integration/benchmarks/fixtures/python/rosetta/src/core_types.py

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/benchmarks/fixtures/python/rosetta/src/core_types.py
- Live Doc ID: LD-implementation-tests-integration-benchmarks-fixtures-python-rosetta-src-core-types-py
- Generated At: 2026-01-14T22:47:33.809Z

## Authored
### Purpose
Type definitions for the Python Rosetta Stone fixture using TypedDict.

### Notes
See [2026-01-14.1.md](../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-14.1.md). Named core_types.py (not types.py) to avoid Python stdlib collision.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-14T22:47:33.809Z","inputHash":"e3b8fc9fce2488b9"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Status` {#symbol-status}
- Type: class
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/python/rosetta/src/core_types.py#L14)
- Extends: `Enum`

##### `Status` — Summary
Status enumeration for records.

#### `Entry` {#symbol-entry}
- Type: class
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/python/rosetta/src/core_types.py#L22)

##### `Entry` — Summary
A timestamped entry in the data pipeline.

#### `ProcessorConfig` {#symbol-processorconfig}
- Type: class
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/python/rosetta/src/core_types.py#L30)

##### `ProcessorConfig` — Summary
Configuration for processing operations.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `dataclasses` - `dataclass`
- `datetime` - `datetime`
- `enum` - `Enum`
- `typing` - `List`
<!-- LIVE-DOC:END Dependencies -->
