# packages/shared/src/inference/heuristics/shared.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/inference/heuristics/shared.ts
- Live Doc ID: LD-implementation-packages-shared-src-inference-heuristics-shared-ts
- Generated At: 2025-12-07T21:41:19.154Z

## Authored
### Purpose
Provides the cross-language path normalisation, comment filtering, and reference scoring helpers that every modular fallback heuristic shares after we split the 2k-line orchestrator into discrete modules on Nov 7 so new languages plug into the same contract without duplicating logic <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-07.md#L760-L840> <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-07.md#L820-L900>.

### Notes
- `isWithinComment` and the variant builders preserve the Ky benchmark fix that stopped commented-out imports from emitting edges, so keep tests guarding that regression in place whenever evolving these helpers <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-01.md#L2108-L2178>.
- The extension-swapping logic was introduced to keep `.js` specifiers mapped onto `.ts/.tsx` sources; extend the replacement list in this helper instead of reimplementing it in future heuristics <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-01.md#L2302-L2315>.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-07T21:41:19.154Z","inputHash":"a3f4e0d66bbbf22a"}]} -->
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
- [analyzeWithAI.test.ts](../../../../extension/src/commands/analyzeWithAI.test.ts.mdmd.md)
- [exportDiagnostics.test.ts](../../../../extension/src/commands/exportDiagnostics.test.ts.mdmd.md)
- [inspectSymbolNeighbors.test.ts](../../../../extension/src/commands/inspectSymbolNeighbors.test.ts.mdmd.md)
- [dependencyQuickPick.test.ts](../../../../extension/src/diagnostics/dependencyQuickPick.test.ts.mdmd.md)
- [docDiagnosticProvider.test.ts](../../../../extension/src/diagnostics/docDiagnosticProvider.test.ts.mdmd.md)
- [localOllamaBridge.test.ts](../../../../extension/src/services/localOllamaBridge.test.ts.mdmd.md)
- [symbolBridge.test.ts](../../../../extension/src/services/symbolBridge.test.ts.mdmd.md)
- [saveCodeChange.test.ts](../../../../server/src/features/changeEvents/saveCodeChange.test.ts.mdmd.md)
- [saveDocumentChange.test.ts](../../../../server/src/features/changeEvents/saveDocumentChange.test.ts.mdmd.md)
- [inspectDependencies.test.ts](../../../../server/src/features/dependencies/inspectDependencies.test.ts.mdmd.md)
- [symbolNeighbors.test.ts](../../../../server/src/features/dependencies/symbolNeighbors.test.ts.mdmd.md)
- [acknowledgementService.test.ts](../../../../server/src/features/diagnostics/acknowledgementService.test.ts.mdmd.md)
- [listOutstandingDiagnostics.test.ts](../../../../server/src/features/diagnostics/listOutstandingDiagnostics.test.ts.mdmd.md)
- [noiseFilter.test.ts](../../../../server/src/features/diagnostics/noiseFilter.test.ts.mdmd.md)
- [publishDocDiagnostics.test.ts](../../../../server/src/features/diagnostics/publishDocDiagnostics.test.ts.mdmd.md)
- [feedFormatDetector.test.ts](../../../../server/src/features/knowledge/feedFormatDetector.test.ts.mdmd.md)
- [knowledgeFeedManager.test.ts](../../../../server/src/features/knowledge/knowledgeFeedManager.test.ts.mdmd.md)
- [knowledgeGraphBridge.test.ts](../../../../server/src/features/knowledge/knowledgeGraphBridge.test.ts.mdmd.md)
- [knowledgeGraphIngestor.test.ts](../../../../server/src/features/knowledge/knowledgeGraphIngestor.test.ts.mdmd.md)
- [llmIngestionOrchestrator.test.ts](../../../../server/src/features/knowledge/llmIngestionOrchestrator.test.ts.mdmd.md)
- [lsifParser.test.ts](../../../../server/src/features/knowledge/lsifParser.test.ts.mdmd.md)
- [rippleAnalyzer.test.ts](../../../../server/src/features/knowledge/rippleAnalyzer.test.ts.mdmd.md)
- [scipParser.test.ts](../../../../server/src/features/knowledge/scipParser.test.ts.mdmd.md)
- [workspaceIndexProvider.test.ts](../../../../server/src/features/knowledge/workspaceIndexProvider.test.ts.mdmd.md)
- [artifactWatcher.test.ts](../../../../server/src/features/watchers/artifactWatcher.test.ts.mdmd.md)
- [pathReferenceDetector.test.ts](../../../../server/src/features/watchers/pathReferenceDetector.test.ts.mdmd.md)
- [environment.test.ts](../../../../server/src/runtime/environment.test.ts.mdmd.md)
- [settings.test.ts](../../../../server/src/runtime/settings.test.ts.mdmd.md)
- [latencyTracker.test.ts](../../../../server/src/telemetry/latencyTracker.test.ts.mdmd.md)
- [fallbackInference.languages.test.ts](../fallbackInference.languages.test.ts.mdmd.md)
- [fallbackInference.test.ts](../fallbackInference.test.ts.mdmd.md)
- [linkInference.test.ts](../linkInference.test.ts.mdmd.md)
- [relationshipRuleProvider.test.ts](../../rules/relationshipRuleProvider.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
