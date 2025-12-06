# tests/integration/benchmarks/fixtures/python/pipeline/src/pipeline.py

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/benchmarks/fixtures/python/pipeline/src/pipeline.py
- Live Doc ID: LD-implementation-tests-integration-benchmarks-fixtures-python-pipeline-src-pipeline-py
- Generated At: 2025-12-06T22:49:48.522Z

## Authored
### Purpose
Orchestrates report construction for the Python pipeline benchmark, tying repositories, validators, and metrics together.

### Notes
Maintain the dataclass wrapper and sequencing—they model the minimal integration flow the benchmark expects.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-06T22:49:48.522Z","inputHash":"af5603c39fb88052"}]} -->
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
- `dataclasses`
- `dataclasses.dataclass` - `dataclass`
- `metrics`
- `metrics.compute_summary` - `compute_summary`
- `repositories`
- `repositories.load_series` - `load_series`
- `validators`
- `validators.ensure_not_empty` - `ensure_not_empty`
<!-- LIVE-DOC:END Dependencies -->
