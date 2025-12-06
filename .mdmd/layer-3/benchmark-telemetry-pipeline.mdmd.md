# Benchmark & Telemetry Reporting

## Metadata
- Layer: 3
- Component IDs: COMP-007

## Components

<a id="comp007-diagnostics-benchmarking"></a>
### COMP-007 Diagnostics Benchmarking
Supports FR-LD3, FR-LD4, and REQ-L3 by producing reproducible performance, accuracy, and regeneration reports that prove Live Documentation pipelines stay fast, deterministic, and trustworthy as adoption scales.

## Responsibilities

### Unified Reporting
- Generate durable per-mode artifacts (for example, `reports/test-report.self-similarity.md`, `reports/test-report.ast.md`) each verification run summarising integration outcomes, benchmark deltas, and telemetry snapshots.
- Harmonise CLI tooling so `npm run verify -- --report` emits structured JSON consumed by the report renderer.
- Leverage the shared formatter (`buildTestReportMarkdown`) so Markdown sections stay consistent across local development and CI runs.
- Add Live Documentation telemetry sections (latency, dependency precision/recall, evidence coverage) sourced from `reports/benchmarks/live-docs/*`.

### Benchmark Automation
- Author reproducible workspaces under `tests/integration/benchmarks` that target graph rebuild stability (T057), inference accuracy (T061), and benchmark mode selection (T062).
- Provide utilities (e.g., `benchmarkRecorder.ts`) that orchestrate fixtures and return comparable metrics.
- Manage benchmark coverage through `fixtures.manifest.json`, allowing `BENCHMARK_MODE` toggles (`self-similarity`, `ast`, `all`) to gate which fixtures run during verification.
- Record per-fixture precision/recall metrics so future regression reports can spotlight language-specific drift.
- Extend automation to Live Doc regeneration benchmarks (`reports/benchmarks/live-docs`) capturing authored preservation and generated section parity.
- Highlight python fixtures (basics, pipeline, requests) in benchmark summaries now that the oracle-backed expectations and fallback heuristics produce 1.0 precision/recall, ensuring regressions stand out immediately.
- Materialise every vendored benchmark by cloning its source repository into an ephemeral staging workspace (under `AI-Agent-Workspace/tmp/benchmarks/<fixture-id>`), pinning the commit declared in the manifest before snapshots or analyzers execute.
- Express file selection through manifest glob rules (`include` / `exclude`) so the integrity pipeline expands, hashes, and documents the resolved set automatically—no manually curated file lists.
- Capture repository provenance (repo, ref, commit, license) in manifest metadata so documentation and staging directories stay reproducible and traceable.
- Expand fixture census across languages (TypeScript, C, Python, Rust, Ruby, Java) with paired baseline and layered scenarios so accuracy metrics surface ecosystem-specific strengths and gaps without co-opting full integration workspaces.

### Compiler-Derived Ground Truth
- Build deterministic TypeScript edge oracles that consume `ts.Program` metadata, classify runtime versus type-only bindings, and emit fixture graphs consistent with ripple semantics.
- Preserve curated, cross-language expectations by layering immutable manual segments atop oracle-generated sections during regeneration.
- Expose regeneration tooling (CLI and scripts) that writes oracle output to review artefacts, highlights drift versus committed baselines, and feeds precision/recall deltas back into benchmark reports.
- Record oracle coverage metrics and unresolved overrides so roadmap stakeholders can triage remaining manual expectations.
- Extend the oracle framework to Python by shelling out to workspace interpreters, harvesting import graphs via `modulefinder` and `importlib.metadata`, and regenerating fixtures such as `psf/requests` without bundling compilers inside the shipped extension.
- Unify manifest- and CLI-level integration so language-specific oracles (TypeScript, Python, forthcoming Rust/C) share interpreter detection, diff artefact handling, and override semantics.

### Telemetry Capture
- Persist inference accuracy metrics alongside Live Doc regeneration latency using shared telemetry modules.
- Expose `InferenceAccuracyTracker.snapshot()` and Live Doc telemetry providers for benchmarks and extension surfaces so adoption metrics reflect live behaviour.

## Interfaces

### Inbound Interfaces
- `npm run verify -- --report` command line switch requesting benchmark runs.
- Shared telemetry collectors invoked by benchmarks and the regression report generator.

### Outbound Interfaces
- Markdown/JSON reports persisted to `reports/test-report.<mode>.md` alongside versioned JSON under `reports/benchmarks/<mode>/`.
- Telemetry updates stored in SQLite (`packages/server/src/telemetry`) for subsequent audits.

## Linked Implementations

### IMP-306 testReportGenerator
Produces the combined verification and benchmark report. [Test Report Generator](../../.mdmd/layer-4/packages/shared/src/reporting/testReport.ts.mdmd.md)

### IMP-307 benchmarkRecorder
Shared utilities powering benchmark fixtures. [Benchmark Recorder](../../.mdmd/layer-4/tests/integration/benchmarks/utils/benchmarkRecorder.ts.mdmd.md)

### IMP-308 inferenceAccuracy Tracker
Captures precision/recall metrics for ripple inference. [Inference Accuracy Telemetry](../../.mdmd/layer-4/packages/shared/src/telemetry/inferenceAccuracy.ts.mdmd.md)

## Evidence
- Benchmark integration suites under `tests/integration/benchmarks` ensure rebuild stability and inference accuracy assertions stay green.
- Latest `npm run safe:commit -- --benchmarks` run (2025-11-04) captured 210 TP / 8 FP / 8 FN (96.3% precision/recall) in `reports/benchmarks/ast/ast-accuracy.json`, with the Python pipeline fixture graduating to 7 TP / 0 FP / 0 FN.
- Live Documentation latency baselines recorded in `reports/benchmarks/live-docs/latency.md` guard regeneration performance budgets.
- Stage-0 Live Doc [`AST Benchmark Fixtures`](./benchmark-fixtures.mdmd.md) captures curated fixture intent and oracle overrides that this component relies on during AST accuracy audits.
- Telemetry unit tests (`inferenceAccuracy.test.ts`, `latencyTracker.test.ts`) protect metric calculations.
- Safe-to-commit pipeline runs `npm run verify -- --report` weekly to produce artefacts referenced in stakeholder updates.

## Operational Notes
- Initial scope excludes full AST fixture curation (T060) and external dashboard publishing.
- Retry/backoff strategy for flaky benchmarks remains configurable; tolerances to be documented as benchmarks evolve.
