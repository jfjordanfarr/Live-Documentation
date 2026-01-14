# tests/integration/benchmarks/fixtures/python/pipeline/src/metrics.py

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/benchmarks/fixtures/python/pipeline/src/metrics.py
- Live Doc ID: LD-implementation-tests-integration-benchmarks-fixtures-python-pipeline-src-metrics-py
- Generated At: 2026-01-14T18:38:50.209Z

## Authored
### Purpose
Calculates aggregate statistics for the Python pipeline benchmark while invoking validators to exercise layered imports.

### Notes
Retain the validation calls ahead of aggregation; they ensure dependency order is visible to the analyzer.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-14T18:38:50.209Z","inputHash":"51659a3b7ef29f23"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `compute_summary` {#symbol-compute_summary}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/python/pipeline/src/metrics.py#L6)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`validators.ensure_not_empty`](./validators.py.mdmd.md#symbol-ensure_not_empty)
- [`validators.ensure_positive`](./validators.py.mdmd.md#symbol-ensure_positive)
- `typing` - `Sequence`
<!-- LIVE-DOC:END Dependencies -->
