# Polyglot Oracles & Sampling Harness

## Metadata

- Layer: 3
- Component IDs: COMP-013, COMP-014

## Components

### COMP 013 Polyglot Fixture Oracles

Orchestrates deterministic AST-grounded expectations for C, Rust, Java, Ruby, Python, and TypeScript fixtures so benchmark pipelines and the Live Doc generator can quantify inference accuracy without relying on probabilistic models. Supports FR-LD2 and REQ-030 by guaranteeing every curated workspace exposes a compiler-verified baseline before telemetry rolls up into adoption reports.

### COMP 014 LLM Sampling Harness

Provides an optional, confidence-gated sampling layer that augments deterministic oracle data with LLM proposals while preserving provenance, reviewer control, and falsifiable telemetry. Supports REQ-020 and REQ-030 by ensuring any AI-derived relationship first passes through explicit consent, scoring, and drift reporting.

## Responsibilities

### Deterministic Coverage (COMP-013)

- Discover project-local toolchains (compiler, interpreter, or build metadata) and normalise them into a consistent oracle interface.
- Produce ordered, reproducible edge lists with provenance annotations and override hooks so fixture regeneration and Live Doc generation remain reviewable.
- Surface per-language coverage metrics back to benchmark reporters, Live Doc dependency accuracy dashboards, and telemetry so gaps trigger operational alerts.
- Export symbol tables and dependency graphs consumable by the Live Doc generator when analyzer coverage lags behind oracle fidelity.

### Confidence-Gated Sampling (COMP-014)

- Collect multiple LLM responses per prompt, score each proposal, and emit only edges meeting configured agreement thresholds.
- Attach provenance metadata (model, prompt template, sampled tokens) so downstream reviewers can replay or audit suggestions.
- Record divergence between deterministic oracles and sampled edges, flagging disagreements for manual review instead of auto-merging.

## Interfaces

### Fixture Oracle Registry

- Exposes a registry keyed by language that loads implementations from `packages/shared/src/testing/fixtureOracles/*FixtureOracle.ts`.
- Provides a shared options schema (paths, include/exclude globs, override manifests, toolchain hints) consumed by regeneration CLIs under `scripts/fixture-tools/`.
- Emits structured results consumed by `tests/integration/benchmarks/astAccuracy.test.ts`, `reports/benchmarks/**/*`, and Live Doc generator adapters.

### Sampling Harness API

- Defines `runSamplingSession(options)` within `packages/shared/src/inference/llmSampling.ts`, accepting prompt variants, seed edges, and stopping conditions.
- Produces a scored edge bundle with agreement metadata that `packages/shared/src/inference/linkInference.ts` can merge behind configurable confidence thresholds.
- Streams telemetry hooks into `packages/shared/src/telemetry/inferenceAccuracy.ts` so sampling outcomes appear alongside deterministic totals.

### Telemetry Hooks

- Emits per-language oracle coverage, runtime duration, and toolchain provenance into benchmark reports for reproducibility.
- Captures sampling agreement, rejection reasons, and reviewer decisions so operators can triage noisy models quickly.

## Linked Implementations

- [IMP-509–523 SCIP Normalizer (TypeScript, Python, Rust, Java, C#, Go)](../../.mdmd/layer-4/packages/shared/src/testing/fixtureOracles/scipNormalizer.ts.mdmd.md)
- [IMP-521 C Fixture Oracle](../../.mdmd/layer-4/packages/shared/src/testing/fixtureOracles/cFixtureOracle.ts.mdmd.md)
- [IMP-524 Ruby Fixture Oracle](../../.mdmd/layer-4/packages/shared/src/testing/fixtureOracles/rubyFixtureOracle.ts.mdmd.md)
- ~~IMP-530 LLM Sampling Harness~~ *(Descoped 2026-02-17 — source and Live Doc deleted)*
- [IMP-510 Benchmark Fixture Regenerator](../../.mdmd/layer-4/scripts/fixture-tools/regenerate-benchmarks.ts.mdmd.md)

## Evidence

- `npm run test:benchmarks -- --suite ast` produces precision/recall figures per language, verifying deterministic oracle parity across curated fixtures.
- `reports/benchmarks/ast/ast-accuracy.json` records oracle coverage deltas, highlighting gaps before new languages ship.
- Live Documentation parity benchmark (`reports/benchmarks/live-docs/precision.json`) now records precision 100% with recall 98.62% for symbols and precision 100% with recall 99.90% for dependencies, comparing generated `Public Symbols`/`Dependencies` against oracle ground truth.
- ~~Upcoming sampling reliability suite (Phase 8) will capture agreement metrics between deterministic edges and LLM proposals, providing falsifiable evidence before enabling auto-suggest flows.~~ *(Descoped 2026-02-17)*

## Operational Notes

- Polyglot oracles must fail soft when toolchains are unavailable, preserving prior expectations and surfacing actionable remediation guidance.
- ~~Sampling harness defaults to "observe" mode; promotion to "guard" or "apply" requires explicit product decisions captured in Layer 1/2 roadmaps.~~ *(Descoped 2026-02-17)*
- ~~Telemetry events for both components should route through existing safe-to-commit reporters so regressions appear during pre-commit validation.~~ *(Descoped 2026-02-17)*
