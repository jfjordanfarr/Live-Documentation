# tests/integration/programs/python/rosetta/src/models.py

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/python/rosetta/src/models.py
- Live Doc ID: LD-test-tests-integration-programs-python-rosetta-src-models-py
- Generated At: 2026-09-27T18:53:07.620Z

## Authored
### Purpose
Data models for the Python Rosetta Stone fixture. Defines Record and Report dataclasses.

### Notes
See [2026-01-14.1.md](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-14.1.md). Multi-consumer module imported by main.py and processor.py.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T18:53:07.620Z","inputHash":"78ae4677dba4f5a1"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Record` {#symbol-record}
- Type: class
- Source: [source](../../../../../../../../tests/integration/programs/python/rosetta/src/models.py#L15)
- Extends: [`Entry`](./core_types.py.mdmd.md#symbol-entry)

##### `Record` — Summary
A data record to be processed.

#### `Report` {#symbol-report}
- Type: class
- Source: [source](../../../../../../../../tests/integration/programs/python/rosetta/src/models.py#L22)

##### `Report` — Summary
Summary report produced by the processor.

#### `create_record` {#symbol-create_record}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/python/rosetta/src/models.py#L30)

##### `create_record` — Summary
Factory for creating records with sensible defaults.

#### `validate_config` {#symbol-validate_config}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/python/rosetta/src/models.py#L41)

##### `validate_config` — Summary
Validates configuration is within acceptable bounds.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `dataclasses` - `dataclass`, `field`
- `datetime` - `datetime`
- [`core_types.Entry`](./core_types.py.mdmd.md#symbol-entry)
- [`core_types.ProcessorConfig`](./core_types.py.mdmd.md#symbol-processorconfig)
- [`core_types.Status`](./core_types.py.mdmd.md#symbol-status)
- `typing` - `List`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
