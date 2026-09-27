# tests/integration/programs/rust/analytics/src/metrics.rs

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/rust/analytics/src/metrics.rs
- Generated At: 2026-09-27T23:21:38.844Z

## Authored
### Purpose
Implements the summarization and alert thresholds for the Rust analytics benchmark, showcasing doc-comments and helper composition.

### Notes
Preserve the inline documentation and threshold values—they ensure the analyzer sees rich symbol metadata in this fixture.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `summarize` {#symbol-summarize}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/rust/analytics/src/metrics.rs#L27)
- Returns: [`Summary`](./models.rs.mdmd.md#symbol-summary)
- Parameters: `samples`: [`Sample`](./models.rs.mdmd.md#symbol-sample)

##### `summarize` — Summary
Computes aggregate statistics for a batch of samples.

##### `summarize` — Remarks
Provides the calling code with the average value plus the label of the
first sample, mirroring the summarization logic inside the analytics
fixture.

##### `summarize` — Parameters
- `samples`: Collection of readings whose values will be aggregated.

##### `summarize` — Returns
A [`Summary`] populated with the mean value and a best-effort label.

##### `summarize` — Exceptions
- `Panics`: Panics when an empty slice is provided and `.first()` is unreachable.

##### `summarize` — Examples
```rust
use analytics::metrics;
use analytics::models::{Sample, Summary};

let samples = vec![Sample { label: "sensor-a".into(), value: 10.0 }];
let summary: Summary = metrics::summarize(&samples);
assert_eq!(summary.label, "sensor-a");
```

#### `is_alert` {#symbol-is_alert}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/rust/analytics/src/metrics.rs#L49)
- Parameters: `summary`: [`Summary`](./models.rs.mdmd.md#symbol-summary)

##### `is_alert` — Summary
Flags summaries whose average exceeds the alert threshold.

##### `is_alert` — Parameters
- `summary`: Result from [`summarize`] that will be evaluated.

##### `is_alert` — Returns
`true` when the average is above `50.0`, otherwise `false`.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`main`](./main.rs.mdmd.md)
- [`models.Sample`](./models.rs.mdmd.md#symbol-sample)
- [`models.Summary`](./models.rs.mdmd.md#symbol-summary)
<!-- LIVE-DOC:END Dependencies -->
