# tests/integration/programs/rust/analytics/src/main.rs

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/rust/analytics/src/main.rs
- Live Doc ID: LD-test-tests-integration-programs-rust-analytics-src-main-rs
- Generated At: 2026-09-27T18:53:08.156Z

## Authored
### Purpose
Acts as the entry point for the Rust analytics benchmark, invoking IO and metrics modules so cross-crate imports are exercised.

### Notes
Maintain parity with the supporting modules; this file should stay lightweight to keep the dependency graph focused.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T18:53:08.156Z","inputHash":"7779370896bfd60d"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `analytics::run_analysis`
- `io::load_series`
- [`analytics`](./analytics.rs.mdmd.md)
- [`io`](./io.rs.mdmd.md)
- [`metrics`](./metrics.rs.mdmd.md)
- [`models`](./models.rs.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
