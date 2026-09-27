# tests/integration/programs/python/pipeline/src/pipeline.py

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/python/pipeline/src/pipeline.py
- Generated At: 2026-09-27T23:21:37.918Z

## Authored
### Purpose
Orchestrates report construction for the Python pipeline benchmark, tying repositories, validators, and metrics together.

### Notes
Maintain the dataclass wrapper and sequencing—they model the minimal integration flow the benchmark expects.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Report` {#symbol-report}
- Type: class
- Source: [source](../../../../../../../../tests/integration/programs/python/pipeline/src/pipeline.py#L9)

#### `status` {#symbol-status}
- Type: field
- Source: [source](../../../../../../../../tests/integration/programs/python/pipeline/src/pipeline.py#L10)

#### `payload` {#symbol-payload}
- Type: field
- Source: [source](../../../../../../../../tests/integration/programs/python/pipeline/src/pipeline.py#L11)

#### `build_report` {#symbol-build_report}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/python/pipeline/src/pipeline.py#L14)
- Returns: [`Report`](../../rosetta/src/models.py.mdmd.md#symbol-report)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `dataclasses` - `dataclass`
- [`metrics.compute_summary`](./metrics.py.mdmd.md#symbol-compute_summary)
- [`repositories.load_series`](./repositories.py.mdmd.md#symbol-load_series)
- [`validators.ensure_not_empty`](./validators.py.mdmd.md#symbol-ensure_not_empty)
<!-- LIVE-DOC:END Dependencies -->
