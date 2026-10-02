# tests/integration/programs/python/pipeline/src/repositories.py

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/python/pipeline/src/repositories.py
- Generated At: 2026-10-02T20:20:07.735Z

## Authored
### Purpose
Provides dataset loading for the Python pipeline benchmark, including error paths that trigger validator coverage.

### Notes
Dataset values are intentionally simple; adjust the structure only when altering expected analyzer edges.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `load_series` {#symbol-load_series}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/python/pipeline/src/repositories.py#L11)
- Returns: `List`
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`validators.ValidationError`](./validators.py.mdmd.md#symbol-validationerror)
- `typing` - `List`
<!-- LIVE-DOC:END Dependencies -->
