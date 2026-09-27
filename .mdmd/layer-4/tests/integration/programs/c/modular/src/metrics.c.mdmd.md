# tests/integration/programs/c/modular/src/metrics.c

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/c/modular/src/metrics.c
- Live Doc ID: LD-test-tests-integration-programs-c-modular-src-metrics-c
- Generated At: 2026-09-27T18:53:04.990Z

## Authored
### Purpose
Provides the averaging and clamping routines for the C modular benchmark so analyzer coverage spans shared headers.

### Notes
Function signatures mirror `metrics.h`; keep them aligned to avoid breaking downstream includes.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T18:53:04.990Z","inputHash":"769e853e46dca392"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `compute_average` {#symbol-compute_average}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/c/modular/src/metrics.c#L6)

##### `compute_average` — Summary
Implementation for compute_average declared in metrics.h.

#### `clamp` {#symbol-clamp}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/c/modular/src/metrics.c#L22)

##### `clamp` — Summary
Implementation for clamp declared in metrics.h.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`metrics.clamp`](./metrics.h.mdmd.md#symbol-clamp)
- [`metrics.compute_average`](./metrics.h.mdmd.md#symbol-compute_average)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
