# packages/shared/src/inference/heuristics/artifactLayerUtils.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/inference/heuristics/artifactLayerUtils.ts
- Live Doc ID: LD-implementation-packages-shared-src-inference-heuristics-artifactlayerutils-ts
- Generated At: 2025-12-05T15:37:25.151Z

## Authored
### Purpose
Defines the layer guards (`isDocumentLayer`, `isImplementationLayer`) that the Nov 7 fallback inference refactor introduced so every heuristic can short-circuit outside its target strata and keep the orchestrator under 500 lines <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-07.md#L772-L1310>.

### Notes
- Shared by all language heuristics after the modularization commit that landed on Nov 8; keep these helpers stable unless roadmap updates redefine the layer taxonomy consumed by `FallbackHeuristic` ordering <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-08.md#L60-L140>.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-05T15:37:25.151Z","inputHash":"e5d17f480037adaf"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `isDocumentLayer` {#symbol-isdocumentlayer}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/inference/heuristics/artifactLayerUtils.ts#L3)
- Parameters: `layer`: [`ArtifactLayer`](../../../../extension/src/shared/artifactSchemas.ts.mdmd.md#symbol-artifactlayer)

#### `isImplementationLayer` {#symbol-isimplementationlayer}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/inference/heuristics/artifactLayerUtils.ts#L7)
- Parameters: `layer`: [`ArtifactLayer`](../../../../extension/src/shared/artifactSchemas.ts.mdmd.md#symbol-artifactlayer)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`artifacts.ArtifactLayer`](../../domain/artifacts.ts.mdmd.md#symbol-artifactlayer) (type-only)
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
