# packages/server/src/telemetry/inferenceAccuracy.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/telemetry/inferenceAccuracy.ts
- Live Doc ID: LD-implementation-packages-server-src-telemetry-inferenceaccuracy-ts
- Generated At: 2025-11-24T15:19:58.968Z

## Authored
### Purpose
Re-exports the shared inference-accuracy tracker after the telemetry relocation in [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-28.SUMMARIZED.md#turn-29-shared-telemetry-relocation--alias-fallout-lines-3202-3335](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-28.SUMMARIZED.md#turn-29-shared-telemetry-relocation--alias-fallout-lines-3202-3335), keeping existing server imports stable while benchmarks and diagnostics consume the unified implementation.

### Notes
This file exists purely for backward compatibility—new code should import from `@copilot-improvement/shared/telemetry/inferenceAccuracy`. The re-export was added during the benchmark scaffold described in [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-28.SUMMARIZED.md#turn-34-coverage-scope-trim--graph-audit-remediation-lines-4402-5601](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-28.SUMMARIZED.md#turn-34-coverage-scope-trim--graph-audit-remediation-lines-4402-5601), and we should delete it once downstream modules are migrated.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-11-24T15:19:58.968Z","inputHash":"f7e0c37a325e8864"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `AccuracySample` {#symbol-accuracysample}
- Type: type
- Source: [source](../../../../../../packages/server/src/telemetry/inferenceAccuracy.ts#L14)

#### `AccuracyTotals` {#symbol-accuracytotals}
- Type: type
- Source: [source](../../../../../../packages/server/src/telemetry/inferenceAccuracy.ts#L15)

#### `BenchmarkAccuracySummary` {#symbol-benchmarkaccuracysummary}
- Type: type
- Source: [source](../../../../../../packages/server/src/telemetry/inferenceAccuracy.ts#L16)

#### `InferenceAccuracySummary` {#symbol-inferenceaccuracysummary}
- Type: type
- Source: [source](../../../../../../packages/server/src/telemetry/inferenceAccuracy.ts#L17)

#### `InferenceAccuracyTrackerOptions` {#symbol-inferenceaccuracytrackeroptions}
- Type: type
- Source: [source](../../../../../../packages/server/src/telemetry/inferenceAccuracy.ts#L18)

#### `InferenceOutcome` {#symbol-inferenceoutcome}
- Type: type
- Source: [source](../../../../../../packages/server/src/telemetry/inferenceAccuracy.ts#L19)

#### `RecordOutcomeOptions` {#symbol-recordoutcomeoptions}
- Type: type
- Source: [source](../../../../../../packages/server/src/telemetry/inferenceAccuracy.ts#L20)

#### `InferenceAccuracyTracker` {#symbol-inferenceaccuracytracker}
- Type: class
- Source: [source](../../../../../../packages/server/src/telemetry/inferenceAccuracy.ts#L22)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared/telemetry/inferenceAccuracy` - `AccuracySample`, `AccuracyTotals`, `BenchmarkAccuracySummary`, `InferenceAccuracySummary`, `InferenceAccuracyTracker`, `InferenceAccuracyTrackerOptions`, `InferenceOutcome`, `RecordOutcomeOptions`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [inferenceAccuracy.test.ts](./inferenceAccuracy.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
