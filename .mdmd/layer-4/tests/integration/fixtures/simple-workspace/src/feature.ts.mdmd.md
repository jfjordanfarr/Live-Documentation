# tests/integration/fixtures/simple-workspace/src/feature.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/simple-workspace/src/feature.ts
- Live Doc ID: LD-implementation-tests-integration-fixtures-simple-workspace-src-feature-ts
- Generated At: 2026-02-03T21:55:50.539Z

## Authored
### Purpose
Implements the intermediate feature evaluation layer for the simple-workspace integration fixture so code-impact tests can route `core.processRequest` inputs through predictable branches before hitting normalization utilities <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-21.md#L2779-L2904>.

### Notes
- `evaluateFeature` and `executeFeature` orchestrate enum-like branching that the US1 pipeline depends on when asserting dependency fan-out; keep these in sync with the fixture diagrams captured in `docs/architecture.md` <../../../../../../../tests/integration/fixtures/simple-workspace/docs/architecture.md>.
- The Oct 21 reset kept this module aligned with `core.ts` and `util.ts`, and the arrangement was later validated by the Oct 29 fixture verification run; repeat that manifest if behavior shifts <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-21.md#L3041-L3238> <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-29.md#L5288-L5320>.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:50.539Z","inputHash":"e7df51bd9d1bc536"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `FeatureEvaluation` {#symbol-featureevaluation}
- Type: interface
- Source: [source](../../../../../../../tests/integration/fixtures/simple-workspace/src/feature.ts#L3)

#### `evaluateFeature` {#symbol-evaluatefeature}
- Type: function
- Source: [source](../../../../../../../tests/integration/fixtures/simple-workspace/src/feature.ts#L9)
- Returns: [`FeatureEvaluation`](#symbol-featureevaluation)

#### `executeFeature` {#symbol-executefeature}
- Type: function
- Source: [source](../../../../../../../tests/integration/fixtures/simple-workspace/src/feature.ts#L19)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`util.normalizeValue`](./util.ts.mdmd.md#symbol-normalizevalue)
- [`util.summarizeShape`](./util.ts.mdmd.md#symbol-summarizeshape)
<!-- LIVE-DOC:END Dependencies -->
