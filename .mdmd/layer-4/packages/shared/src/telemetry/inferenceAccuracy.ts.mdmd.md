# packages/shared/src/telemetry/inferenceAccuracy.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/telemetry/inferenceAccuracy.ts
- Live Doc ID: LD-implementation-packages-shared-src-telemetry-inferenceaccuracy-ts
- Generated At: 2026-02-17T21:51:00.645Z

## Authored
### Purpose

Tracks LLM benchmark outcomes across repos so shared tooling, server telemetry, and extension commands can analyze precision/recall from a single workspace-friendly collector.[AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-28.SUMMARIZED.md#turn-29-shared-telemetry-relocation--alias-fallout-lines-3202-3335]

### Notes

- Moved into `packages/shared` while refactoring the benchmark harness, keeping AST and rebuild suites aligned with the same accuracy calculations.[AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-28.SUMMARIZED.md#turn-29-shared-telemetry-relocation--alias-fallout-lines-3202-3335]
- Documented during the symbol-coverage remediation pass that pushed telemetry exports to 100 % coverage, confirming audits read the tracker headings.[AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-28.SUMMARIZED.md#turn-34-coverage-scope-trim--graph-audit-remediation-lines-4402-5601]

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-17T21:51:00.645Z","inputHash":"ed01db79e778f1bf"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `InferenceOutcome` {#symbol-inferenceoutcome}
- Type: type
- Source: [source](../../../../../../packages/shared/src/telemetry/inferenceAccuracy.ts#L6)

##### `InferenceOutcome` — Summary
Classification of an inference result against the ground-truth oracle.

#### `RecordOutcomeOptions` {#symbol-recordoutcomeoptions}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/telemetry/inferenceAccuracy.ts#L11)

##### `RecordOutcomeOptions` — Summary
Parameters for recording a single inference accuracy observation.

#### `InferenceAccuracyTrackerOptions` {#symbol-inferenceaccuracytrackeroptions}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/telemetry/inferenceAccuracy.ts#L31)

##### `InferenceAccuracyTrackerOptions` — Summary
Configuration for the {@link InferenceAccuracyTracker}.

#### `AccuracySample` {#symbol-accuracysample}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/telemetry/inferenceAccuracy.ts#L45)

##### `AccuracySample` — Summary
A single accuracy observation stored in the tracker's ring buffer.

#### `AccuracyTotals` {#symbol-accuracytotals}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/telemetry/inferenceAccuracy.ts#L66)

##### `AccuracyTotals` — Summary
Aggregate accuracy statistics: weighted totals plus standard
precision, recall, and F1 score (nullable when denominators are 0).

#### `BenchmarkAccuracySummary` {#symbol-benchmarkaccuracysummary}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/telemetry/inferenceAccuracy.ts#L84)
- Extends: [`AccuracyTotals`](#symbol-accuracytotals)

##### `BenchmarkAccuracySummary` — Summary
Per-benchmark accuracy breakdown extending {@link AccuracyTotals}.

#### `InferenceAccuracySummary` {#symbol-inferenceaccuracysummary}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/telemetry/inferenceAccuracy.ts#L91)

##### `InferenceAccuracySummary` — Summary
Complete accuracy snapshot returned by {@link InferenceAccuracyTracker.snapshot}.

#### `InferenceAccuracyTracker` {#symbol-inferenceaccuracytracker}
- Type: class
- Source: [source](../../../../../../packages/shared/src/telemetry/inferenceAccuracy.ts#L118)

##### `InferenceAccuracyTracker` — Summary
Tracks inference accuracy metrics (precision, recall, F1) across
multiple benchmark suites with a bounded ring-buffer of recent samples.

Used by the benchmark harness to accumulate per-edge TP/FP/FN outcomes
and produce aggregate accuracy reports.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`normalizeFileUri`](../uri/normalizeFileUri.ts.mdmd.md#symbol-normalizefileuri)
<!-- LIVE-DOC:END Dependencies -->
