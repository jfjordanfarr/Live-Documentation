# tests/integration/benchmarks/fixtures/c/modular/src/metrics.c

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/benchmarks/fixtures/c/modular/src/metrics.c
- Live Doc ID: LD-implementation-tests-integration-benchmarks-fixtures-c-modular-src-metrics-c
- Generated At: 2025-12-06T23:20:03.044Z

## Authored
### Purpose
Provides the averaging and clamping routines for the C modular benchmark so analyzer coverage spans shared headers.

### Notes
Function signatures mirror `metrics.h`; keep them aligned to avoid breaking downstream includes.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-06T23:20:03.044Z","inputHash":"82ecfac7f1ecb1c2"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `compute_average` {#symbol-compute_average}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/c/modular/src/metrics.c#L6)

##### `compute_average` — Summary
Implementation for compute_average declared in metrics.h.

#### `clamp` {#symbol-clamp}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/c/modular/src/metrics.c#L22)

##### `clamp` — Summary
Implementation for clamp declared in metrics.h.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`metrics.clamp`](./metrics.h.mdmd.md#symbol-clamp)
- [`metrics.compute_average`](./metrics.h.mdmd.md#symbol-compute_average)
<!-- LIVE-DOC:END Dependencies -->
