# tests/integration/programs/python/pipeline/src/metrics.py

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/python/pipeline/src/metrics.py
- Live Doc ID: LD-test-tests-integration-programs-python-pipeline-src-metrics-py
- Generated At: 2026-09-27T18:53:07.507Z

## Authored
### Purpose
Calculates aggregate statistics for the Python pipeline benchmark while invoking validators to exercise layered imports.

### Notes
Retain the validation calls ahead of aggregation; they ensure dependency order is visible to the analyzer.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T18:53:07.507Z","inputHash":"2fc9485f0535bcb6"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `compute_summary` {#symbol-compute_summary}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/python/pipeline/src/metrics.py#L6)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`validators.ensure_not_empty`](./validators.py.mdmd.md#symbol-ensure_not_empty)
- [`validators.ensure_positive`](./validators.py.mdmd.md#symbol-ensure_positive)
- `typing` - `Sequence`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
