# packages/server/src/telemetry/inferenceAccuracy.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/telemetry/inferenceAccuracy.ts
- Live Doc ID: LD-implementation-packages-server-src-telemetry-inferenceaccuracy-ts
- Generated At: 2026-02-03T21:55:38.436Z

## Authored
### Purpose
Re-exports the shared inference-accuracy tracker after the telemetry relocation in [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-28.SUMMARIZED.md#turn-29-shared-telemetry-relocation--alias-fallout-lines-3202-3335](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-28.SUMMARIZED.md#turn-29-shared-telemetry-relocation--alias-fallout-lines-3202-3335), keeping existing server imports stable while benchmarks and diagnostics consume the unified implementation.

### Notes
This file exists purely for backward compatibility—new code should import from `@live-documentation/shared/telemetry/inferenceAccuracy`. The re-export was added during the benchmark scaffold described in [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-28.SUMMARIZED.md#turn-34-coverage-scope-trim--graph-audit-remediation-lines-4402-5601](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-28.SUMMARIZED.md#turn-34-coverage-scope-trim--graph-audit-remediation-lines-4402-5601), and we should delete it once downstream modules are migrated.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:38.436Z","inputHash":"ebbfb9cb57de2712"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `AccuracySample` {#symbol-accuracysample}
- Type: type
- Source: [source](../../../../../../packages/server/src/telemetry/inferenceAccuracy.ts#L14)
- Returns: `SharedAccuracySample`

#### `AccuracyTotals` {#symbol-accuracytotals}
- Type: type
- Source: [source](../../../../../../packages/server/src/telemetry/inferenceAccuracy.ts#L15)
- Returns: `SharedAccuracyTotals`

#### `BenchmarkAccuracySummary` {#symbol-benchmarkaccuracysummary}
- Type: type
- Source: [source](../../../../../../packages/server/src/telemetry/inferenceAccuracy.ts#L16)
- Returns: `SharedBenchmarkAccuracySummary`

#### `InferenceAccuracySummary` {#symbol-inferenceaccuracysummary}
- Type: type
- Source: [source](../../../../../../packages/server/src/telemetry/inferenceAccuracy.ts#L17)
- Returns: `SharedInferenceAccuracySummary`

#### `InferenceAccuracyTrackerOptions` {#symbol-inferenceaccuracytrackeroptions}
- Type: type
- Source: [source](../../../../../../packages/server/src/telemetry/inferenceAccuracy.ts#L18)
- Returns: `SharedInferenceAccuracyTrackerOptions`

#### `InferenceOutcome` {#symbol-inferenceoutcome}
- Type: type
- Source: [source](../../../../../../packages/server/src/telemetry/inferenceAccuracy.ts#L19)
- Returns: `SharedInferenceOutcome`

#### `RecordOutcomeOptions` {#symbol-recordoutcomeoptions}
- Type: type
- Source: [source](../../../../../../packages/server/src/telemetry/inferenceAccuracy.ts#L20)
- Returns: `SharedRecordOutcomeOptions`

#### `InferenceAccuracyTracker` {#symbol-inferenceaccuracytracker}
- Type: class
- Source: [source](../../../../../../packages/server/src/telemetry/inferenceAccuracy.ts#L22)
- Extends: `SharedInferenceAccuracyTracker`
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`inferenceAccuracy.AccuracySample`](../../../shared/src/telemetry/inferenceAccuracy.ts.mdmd.md#symbol-accuracysample)
- [`inferenceAccuracy.AccuracyTotals`](../../../shared/src/telemetry/inferenceAccuracy.ts.mdmd.md#symbol-accuracytotals)
- [`inferenceAccuracy.BenchmarkAccuracySummary`](../../../shared/src/telemetry/inferenceAccuracy.ts.mdmd.md#symbol-benchmarkaccuracysummary)
- [`inferenceAccuracy.InferenceAccuracySummary`](../../../shared/src/telemetry/inferenceAccuracy.ts.mdmd.md#symbol-inferenceaccuracysummary)
- [`inferenceAccuracy.InferenceAccuracyTracker`](../../../shared/src/telemetry/inferenceAccuracy.ts.mdmd.md#symbol-inferenceaccuracytracker)
- [`inferenceAccuracy.InferenceAccuracyTrackerOptions`](../../../shared/src/telemetry/inferenceAccuracy.ts.mdmd.md#symbol-inferenceaccuracytrackeroptions)
- [`inferenceAccuracy.InferenceOutcome`](../../../shared/src/telemetry/inferenceAccuracy.ts.mdmd.md#symbol-inferenceoutcome)
- [`inferenceAccuracy.RecordOutcomeOptions`](../../../shared/src/telemetry/inferenceAccuracy.ts.mdmd.md#symbol-recordoutcomeoptions)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [inferenceAccuracy.test.ts](./inferenceAccuracy.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
