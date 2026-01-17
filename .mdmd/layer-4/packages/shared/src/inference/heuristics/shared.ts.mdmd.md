# packages/shared/src/inference/heuristics/shared.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/inference/heuristics/shared.ts
- Live Doc ID: LD-implementation-packages-shared-src-inference-heuristics-shared-ts
- Generated At: 2026-01-17T19:21:10.047Z

## Authored
### Purpose
Provides the cross-language path normalisation, comment filtering, and reference scoring helpers that every modular fallback heuristic shares after we split the 2k-line orchestrator into discrete modules on Nov 7 so new languages plug into the same contract without duplicating logic <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-07.md#L760-L840> <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-07.md#L820-L900>.

### Notes
- `isWithinComment` and the variant builders preserve the Ky benchmark fix that stopped commented-out imports from emitting edges, so keep tests guarding that regression in place whenever evolving these helpers <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-01.md#L2108-L2178>.
- The extension-swapping logic was introduced to keep `.js` specifiers mapped onto `.ts/.tsx` sources; extend the replacement list in this helper instead of reimplementing it in future heuristics <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-01.md#L2302-L2315>.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-17T19:21:10.047Z","inputHash":"a3f4e0d66bbbf22a"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `cleanupReference` {#symbol-cleanupreference}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/inference/heuristics/shared.ts#L6)

#### `isExternalLink` {#symbol-isexternallink}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/inference/heuristics/shared.ts#L10)

#### `normalizePath` {#symbol-normalizepath}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/inference/heuristics/shared.ts#L14)

#### `stem` {#symbol-stem}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/inference/heuristics/shared.ts#L18)

#### `toComparablePath` {#symbol-tocomparablepath}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/inference/heuristics/shared.ts#L24)

#### `computeReferenceStart` {#symbol-computereferencestart}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/inference/heuristics/shared.ts#L36)
- Parameters: `match`: `RegExpMatchArray`

#### `isWithinComment` {#symbol-iswithincomment}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/inference/heuristics/shared.ts#L49)

#### `buildReferenceVariants` {#symbol-buildreferencevariants}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/inference/heuristics/shared.ts#L88)

#### `VariantMatchScore` {#symbol-variantmatchscore}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/inference/heuristics/shared.ts#L132)

#### `evaluateVariantMatch` {#symbol-evaluatevariantmatch}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/inference/heuristics/shared.ts#L137)
- Returns: [`VariantMatchScore`](#symbol-variantmatchscore)
- Parameters: `candidate`: [`HeuristicArtifact`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-heuristicartifact)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path` - `path`
- `node:url` - `fileURLToPath`
- [`fallbackHeuristicTypes.HeuristicArtifact`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-heuristicartifact) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [symbolBridge.test.ts](../../../../extension/src/services/symbolBridge.test.ts.mdmd.md)
- [noiseFilter.test.ts](../../../../server/src/features/diagnostics/noiseFilter.test.ts.mdmd.md)
- [pathReferenceDetector.test.ts](../../../../server/src/features/watchers/pathReferenceDetector.test.ts.mdmd.md)
- [fallbackInference.languages.test.ts](../fallbackInference.languages.test.ts.mdmd.md)
- [fallbackInference.test.ts](../fallbackInference.test.ts.mdmd.md)
- [linkInference.test.ts](../linkInference.test.ts.mdmd.md)
- [relationshipRuleProvider.test.ts](../../rules/relationshipRuleProvider.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
