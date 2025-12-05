# packages/shared/src/inference/heuristics/referenceResolver.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/inference/heuristics/referenceResolver.ts
- Live Doc ID: LD-implementation-packages-shared-src-inference-heuristics-referenceresolver-ts
- Generated At: 2025-12-05T15:37:25.238Z

## Authored
### Purpose
Centralizes the artifact lookup logic for fallback heuristics, exposing shared helpers that translate raw include/import strings into scored targets once we split the monolith into modular language files on Nov 7 <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-07.md#L760-L840> <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-07.md#L820-L900>.

### Notes
- `resolveIncludeReference` keeps the C benchmarks stable by treating quoted `#include` directives as same-directory lookups; we tightened that behaviour during the modular refactor after the libuv fixture started failing <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-07.md#L1780-L1820>.
- If a future heuristic needs bespoke variant scoring, add it here so every language continues reusing the same normalization/weighting rules that we introduced alongside the Phase 8 polyglot heuristics on Nov 5 <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-05.md#L780-L860>.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-05T15:37:25.238Z","inputHash":"d50398065736ae4d"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ReferenceResolution` {#symbol-referenceresolution}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/inference/heuristics/referenceResolver.ts#L12)

#### `resolveReference` {#symbol-resolvereference}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/inference/heuristics/referenceResolver.ts#L18)
- Returns: `ReferenceResolution`
- Parameters: `source`: [`HeuristicArtifact`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-heuristicartifact)

#### `resolveIncludeReference` {#symbol-resolveincludereference}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/inference/heuristics/referenceResolver.ts#L59)
- Returns: `ReferenceResolution`
- Parameters: `source`: [`HeuristicArtifact`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-heuristicartifact)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path` - `path`
- [`fallbackHeuristicTypes.HeuristicArtifact`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-heuristicartifact) (type-only)
- [`shared.buildReferenceVariants`](./shared.ts.mdmd.md#symbol-buildreferencevariants)
- [`shared.cleanupReference`](./shared.ts.mdmd.md#symbol-cleanupreference)
- [`shared.evaluateVariantMatch`](./shared.ts.mdmd.md#symbol-evaluatevariantmatch)
- [`shared.isExternalLink`](./shared.ts.mdmd.md#symbol-isexternallink)
- [`shared.toComparablePath`](./shared.ts.mdmd.md#symbol-tocomparablepath)
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
