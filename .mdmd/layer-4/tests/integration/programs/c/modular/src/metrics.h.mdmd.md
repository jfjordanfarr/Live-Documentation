# tests/integration/programs/c/modular/src/metrics.h

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/c/modular/src/metrics.h
- Live Doc ID: LD-test-tests-integration-programs-c-modular-src-metrics-h
- Generated At: 2026-09-27T18:53:05.005Z

## Authored
### Purpose
Summarises the statistical helpers exposed to the modular pipeline implementation within the C benchmark fixture.

### Notes
Exports both averaging and clamping routines so the pipeline can normalise values before logging.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T18:53:05.005Z","inputHash":"8e7bf58c23c66134"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `METRICS_H` {#symbol-metrics_h}
- Type: const
- Source: [source](../../../../../../../../tests/integration/programs/c/modular/src/metrics.h#L2)

#### `compute_average` {#symbol-compute_average}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/c/modular/src/metrics.h#L13)

##### `compute_average` — Summary
Computes the arithmetic mean for a sample window.

##### `compute_average` — Parameters
- `values`: Pointer to the contiguous collection of samples.
- `count`: Number of entries available in `values`.

##### `compute_average` — Returns
double Average value or 0.0 when `count` is zero.

#### `clamp` {#symbol-clamp}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/c/modular/src/metrics.h#L23)

##### `clamp` — Summary
Restricts a value to the provided inclusive range.

##### `clamp` — Parameters
- `value`: Candidate value.
- `lower`: Minimum allowed value.
- `upper`: Maximum allowed value.

##### `clamp` — Returns
double Value clamped to the requested bounds.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `stddef.h`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
