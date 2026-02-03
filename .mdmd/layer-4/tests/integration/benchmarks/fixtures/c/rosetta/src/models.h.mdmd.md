# tests/integration/benchmarks/fixtures/c/rosetta/src/models.h

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/benchmarks/fixtures/c/rosetta/src/models.h
- Live Doc ID: LD-implementation-tests-integration-benchmarks-fixtures-c-rosetta-src-models-h
- Generated At: 2026-02-03T21:55:42.584Z

## Authored
### Purpose
C Rosetta Stone fixture source/header file. Part of the cross-language benchmark suite.

### Notes
See [2026-01-14.1.md](../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-14.1.md). Tests C #include and function call graph detection.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:42.584Z","inputHash":"80ea020ab3c1a485"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ROSETTA_MODELS_H` {#symbol-rosetta_models_h}
- Type: const
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/c/rosetta/src/models.h#L9)

#### `create_record` {#symbol-create_record}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/c/rosetta/src/models.h#L41)

##### `create_record` — Summary
Factory for creating records with sensible defaults.

##### `create_record` — Parameters
- `id`: Record identifier
- `value`: Numeric value

##### `create_record` — Returns
Initialized record

#### `validate_config` {#symbol-validate_config}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/c/rosetta/src/models.h#L48)

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
- [`types`](./types.h.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->
