# tests/integration/programs/python/pipeline/src/metrics.py

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/python/pipeline/src/metrics.py
- Generated At: 2026-10-02T20:20:07.640Z

## Authored
### Purpose
Calculates aggregate statistics for the Python pipeline benchmark while invoking validators to exercise layered imports.

### Notes
Retain the validation calls ahead of aggregation; they ensure dependency order is visible to the analyzer.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `compute_summary` {#symbol-compute_summary}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/python/pipeline/src/metrics.py#L6)
- Parameters: `values`: `Sequence`
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`validators.ensure_not_empty`](./validators.py.mdmd.md#symbol-ensure_not_empty)
- [`validators.ensure_positive`](./validators.py.mdmd.md#symbol-ensure_positive)
- `typing` - `Sequence`
<!-- LIVE-DOC:END Dependencies -->
