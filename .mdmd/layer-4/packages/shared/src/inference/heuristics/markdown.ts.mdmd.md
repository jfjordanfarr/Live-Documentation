# packages/shared/src/inference/heuristics/markdown.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/inference/heuristics/markdown.ts
- Live Doc ID: LD-implementation-packages-shared-src-inference-heuristics-markdown-ts
- Generated At: 2025-12-05T15:37:25.219Z

## Authored
### Purpose
Translates Markdown links and wiki-link syntax in Layer‑4 docs into fallback graph edges so documentation ripples stay observable—a requirement we spelled out during the October doc-link standardisation work and implemented once the heuristics suite moved into modular files on Nov 7 <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-30.md#L4518-L4725> <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-07.md#L860-L940>.

### Notes
- Keep this heuristic aligned with the doc link enforcement tooling (`slopcop:markdown`) and the falsifiability integration tests that watch for doc/code drift; rerun those checks after tweaking link parsing so the bidirectional diagnostics remain trustworthy <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-21.SUMMARIZED.md#L60-L110>.
- When we add new link dialects (for example reference-style links or images), extend the shared `resolveReference` path so every documentation heuristic continues sharing the same normalization rules <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-07.md#L820-L900>.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-05T15:37:25.219Z","inputHash":"140e29b9fef3dc9a"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `createMarkdownHeuristic` {#symbol-createmarkdownheuristic}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/inference/heuristics/markdown.ts#L9)
- Returns: [`FallbackHeuristic`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-fallbackheuristic)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`fallbackHeuristicTypes.FallbackHeuristic`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-fallbackheuristic) (type-only)
- [`fallbackHeuristicTypes.HeuristicArtifact`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-heuristicartifact) (type-only)
- [`fallbackHeuristicTypes.MatchEmitter`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-matchemitter) (type-only)
- [`artifactLayerUtils.isDocumentLayer`](./artifactLayerUtils.ts.mdmd.md#symbol-isdocumentlayer)
- [`referenceResolver.resolveReference`](./referenceResolver.ts.mdmd.md#symbol-resolvereference)
- [`shared.cleanupReference`](./shared.ts.mdmd.md#symbol-cleanupreference)
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
