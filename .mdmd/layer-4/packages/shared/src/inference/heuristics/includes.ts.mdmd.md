# packages/shared/src/inference/heuristics/includes.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/inference/heuristics/includes.ts
- Live Doc ID: LD-implementation-packages-shared-src-inference-heuristics-includes-ts
- Generated At: 2025-12-05T15:37:25.193Z

## Authored
### Purpose
Follows `#include` directives so the C fixtures (libuv, modular, basics) keep emitting accurate `include` edges—part of the Nov 5 push that aligned fallback inference with the oracle captures before we re-expanded the curated ground truth <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-05.md#L3098-L3130> <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-05.md#L3498-L3520>.

### Notes
- We tightened `resolveIncludeReference` on Nov 7 after modularizing the suite so quoted includes default to same-directory lookups; keep any future adjustments in that shared resolver to avoid regressions <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-07.md#L1780-L1820>.
- After editing this heuristic, rerun `npm run fixtures:record-fallback -- --lang c` and the AST benchmarks to confirm c-libuv and c-modular stay in sync with their expected include sets <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-05.md#L3098-L3130>.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-05T15:37:25.193Z","inputHash":"3db4a53b261d5f2e"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `createIncludeHeuristic` {#symbol-createincludeheuristic}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/inference/heuristics/includes.ts#L8)
- Returns: [`FallbackHeuristic`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-fallbackheuristic)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`fallbackHeuristicTypes.FallbackHeuristic`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-fallbackheuristic) (type-only)
- [`fallbackHeuristicTypes.HeuristicArtifact`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-heuristicartifact) (type-only)
- [`artifactLayerUtils.isImplementationLayer`](./artifactLayerUtils.ts.mdmd.md#symbol-isimplementationlayer)
- [`referenceResolver.resolveIncludeReference`](./referenceResolver.ts.mdmd.md#symbol-resolveincludereference)
- [`shared.computeReferenceStart`](./shared.ts.mdmd.md#symbol-computereferencestart)
- [`shared.isWithinComment`](./shared.ts.mdmd.md#symbol-iswithincomment)
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
