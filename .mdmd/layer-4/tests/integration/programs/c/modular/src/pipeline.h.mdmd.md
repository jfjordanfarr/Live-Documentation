# tests/integration/programs/c/modular/src/pipeline.h

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/c/modular/src/pipeline.h
- Live Doc ID: LD-test-tests-integration-programs-c-modular-src-pipeline-h
- Generated At: 2026-09-27T21:43:43.416Z

## Authored
### Purpose
Defines the primary analytics entry point for the modular C benchmark, mirroring the signatures exercised by the pipeline implementation.

### Notes
Includes `<stddef.h>` for the `size_t` alias and chains to `metrics.h` so downstream headers stay self-contained during compilation.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T21:43:43.416Z","inputHash":"f9c379bbba81644d"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `PIPELINE_H` {#symbol-pipeline_h}
- Type: const
- Source: [source](../../../../../../../../tests/integration/programs/c/modular/src/pipeline.h#L2)

#### `run_pipeline` {#symbol-run_pipeline}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/c/modular/src/pipeline.h#L14)

##### `run_pipeline` — Summary
Runs the metrics pipeline on a sample collection.

##### `run_pipeline` — Parameters
- `samples`: Values to analyse.
- `count`: Number of entries contained in `samples`.

##### `run_pipeline` — Returns
double Normalized metric returned by the pipeline stages.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `stddef.h`
- [`metrics`](./metrics.h.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->
