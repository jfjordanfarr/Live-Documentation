# tests/integration/benchmarks/fixtures/rust/analytics/src/metrics.rs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/benchmarks/fixtures/rust/analytics/src/metrics.rs
- Live Doc ID: LD-implementation-tests-integration-benchmarks-fixtures-rust-analytics-src-metrics-rs
- Generated At: 2025-12-06T22:49:48.619Z

## Authored
### Purpose
Implements the summarization and alert thresholds for the Rust analytics benchmark, showcasing doc-comments and helper composition.

### Notes
Preserve the inline documentation and threshold values—they ensure the analyzer sees rich symbol metadata in this fixture.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-06T22:49:48.619Z","inputHash":"e5c9201114f64861"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `summarize` {#symbol-summarize}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/rust/analytics/src/metrics.rs#L27)

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
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/rust/analytics/src/metrics.rs#L49)

##### `is_alert` — Summary
Flags summaries whose average exceeds the alert threshold.

##### `is_alert` — Parameters
- `summary`: Result from [`summarize`] that will be evaluated.

##### `is_alert` — Returns
`true` when the average is above `50.0`, otherwise `false`.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `crate::models::{Sample, Summary}`
<!-- LIVE-DOC:END Dependencies -->
