# tests/integration/benchmarks/fixtures/c/modular/src/pipeline.c

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/benchmarks/fixtures/c/modular/src/pipeline.c
- Live Doc ID: LD-implementation-tests-integration-benchmarks-fixtures-c-modular-src-pipeline-c
- Generated At: 2025-12-06T23:20:03.053Z

## Authored
### Purpose
Coordinates metrics and logging for the C modular benchmark, showcasing static helpers and multi-header includes.

### Notes
Preserve the clamp helper and logging branches—they ensure the analyzer sees both internal and external symbol usage.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-06T23:20:03.053Z","inputHash":"09d0482837a1f597"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `normalize` {#symbol-normalize}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/c/modular/src/pipeline.c#L11)

##### `normalize` — Summary
Keeps normalized samples within a 0-100 range.

##### `normalize` — Parameters
- `value`: Candidate value.

##### `normalize` — Returns
double Clamped value used for alerts.

#### `run_pipeline` {#symbol-run_pipeline}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/c/modular/src/pipeline.c#L22)

##### `run_pipeline` — Summary
Computes a bounded average and notifies the logger.

##### `run_pipeline` — Parameters
- `samples`: Values to inspect.
- `count`: Number of entries in `samples`.

##### `run_pipeline` — Returns
double Bounded average used by the caller.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`logger.log_message`](./logger.h.mdmd.md#symbol-log_message)
- [`metrics.clamp`](./metrics.h.mdmd.md#symbol-clamp)
- [`metrics.compute_average`](./metrics.h.mdmd.md#symbol-compute_average)
- [`pipeline.run_pipeline`](./pipeline.h.mdmd.md#symbol-run_pipeline)
<!-- LIVE-DOC:END Dependencies -->
