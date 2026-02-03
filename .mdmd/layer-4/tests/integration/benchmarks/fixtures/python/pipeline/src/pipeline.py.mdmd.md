# tests/integration/benchmarks/fixtures/python/pipeline/src/pipeline.py

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/benchmarks/fixtures/python/pipeline/src/pipeline.py
- Live Doc ID: LD-implementation-tests-integration-benchmarks-fixtures-python-pipeline-src-pipeline-py
- Generated At: 2026-02-03T21:55:44.882Z

## Authored
### Purpose
Orchestrates report construction for the Python pipeline benchmark, tying repositories, validators, and metrics together.

### Notes
Maintain the dataclass wrapper and sequencing—they model the minimal integration flow the benchmark expects.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:44.882Z","inputHash":"e79780b87bed7e91"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Report` {#symbol-report}
- Type: class
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/python/pipeline/src/pipeline.py#L9)

#### `build_report` {#symbol-build_report}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/python/pipeline/src/pipeline.py#L14)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `dataclasses` - `dataclass`
- [`metrics.compute_summary`](./metrics.py.mdmd.md#symbol-compute_summary)
- [`repositories.load_series`](./repositories.py.mdmd.md#symbol-load_series)
- [`validators.ensure_not_empty`](./validators.py.mdmd.md#symbol-ensure_not_empty)
<!-- LIVE-DOC:END Dependencies -->
