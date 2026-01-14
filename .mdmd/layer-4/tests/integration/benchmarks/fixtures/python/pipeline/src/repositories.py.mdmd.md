# tests/integration/benchmarks/fixtures/python/pipeline/src/repositories.py

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/benchmarks/fixtures/python/pipeline/src/repositories.py
- Live Doc ID: LD-implementation-tests-integration-benchmarks-fixtures-python-pipeline-src-repositories-py
- Generated At: 2026-01-14T18:38:50.211Z

## Authored
### Purpose
Provides dataset loading for the Python pipeline benchmark, including error paths that trigger validator coverage.

### Notes
Dataset values are intentionally simple; adjust the structure only when altering expected analyzer edges.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-14T18:38:50.211Z","inputHash":"b3b3432e989e5ac3"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `load_series` {#symbol-load_series}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/python/pipeline/src/repositories.py#L11)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`validators.ValidationError`](./validators.py.mdmd.md#symbol-validationerror)
- `typing` - `List`
<!-- LIVE-DOC:END Dependencies -->
