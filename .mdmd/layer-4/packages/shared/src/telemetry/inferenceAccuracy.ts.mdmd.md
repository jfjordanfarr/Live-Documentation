# packages/shared/src/telemetry/inferenceAccuracy.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/telemetry/inferenceAccuracy.ts
- Live Doc ID: LD-implementation-packages-shared-src-telemetry-inferenceaccuracy-ts
- Generated At: 2026-01-14T15:17:48.818Z

## Authored
### Purpose
Tracks LLM benchmark outcomes across repos so shared tooling, server telemetry, and extension commands can analyze precision/recall from a single workspace-friendly collector.[AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-28.SUMMARIZED.md#turn-29-shared-telemetry-relocation--alias-fallout-lines-3202-3335]

### Notes
- Moved into `packages/shared` while refactoring the benchmark harness, keeping AST and rebuild suites aligned with the same accuracy calculations.[AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-28.SUMMARIZED.md#turn-29-shared-telemetry-relocation--alias-fallout-lines-3202-3335]
- Documented during the symbol-coverage remediation pass that pushed telemetry exports to 100 % coverage, confirming audits read the tracker headings.[AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-28.SUMMARIZED.md#turn-34-coverage-scope-trim--graph-audit-remediation-lines-4402-5601]

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-14T15:17:48.818Z","inputHash":"284e500f7cd2e900"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `InferenceOutcome` {#symbol-inferenceoutcome}
- Type: type
- Source: [source](../../../../../../packages/shared/src/telemetry/inferenceAccuracy.ts#L3)

#### `RecordOutcomeOptions` {#symbol-recordoutcomeoptions}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/telemetry/inferenceAccuracy.ts#L5)

#### `InferenceAccuracyTrackerOptions` {#symbol-inferenceaccuracytrackeroptions}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/telemetry/inferenceAccuracy.ts#L15)

#### `AccuracySample` {#symbol-accuracysample}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/telemetry/inferenceAccuracy.ts#L23)

#### `AccuracyTotals` {#symbol-accuracytotals}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/telemetry/inferenceAccuracy.ts#L33)

#### `BenchmarkAccuracySummary` {#symbol-benchmarkaccuracysummary}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/telemetry/inferenceAccuracy.ts#L43)
- Extends: [`AccuracyTotals`](../../../server/src/telemetry/inferenceAccuracy.ts.mdmd.md#symbol-accuracytotals)

#### `InferenceAccuracySummary` {#symbol-inferenceaccuracysummary}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/telemetry/inferenceAccuracy.ts#L47)

#### `InferenceAccuracyTracker` {#symbol-inferenceaccuracytracker}
- Type: class
- Source: [source](../../../../../../packages/shared/src/telemetry/inferenceAccuracy.ts#L64)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`normalizeFileUri`](../uri/normalizeFileUri.ts.mdmd.md#symbol-normalizefileuri)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [inferenceAccuracy.test.ts](../../../server/src/telemetry/inferenceAccuracy.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
