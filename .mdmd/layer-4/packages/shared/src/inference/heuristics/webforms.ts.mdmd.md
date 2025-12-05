# packages/shared/src/inference/heuristics/webforms.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/inference/heuristics/webforms.ts
- Live Doc ID: LD-implementation-packages-shared-src-inference-heuristics-webforms-ts
- Generated At: 2025-12-05T15:37:25.274Z

## Authored
### Purpose
Captures the WebForms-specific fallback logic we added while wiring the csharp-webforms benchmark so hidden-field values, code-behind partials, and Web.config appSettings all resolve to the right artifacts instead of disappearing from the AST recall runs <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-06.md#L3996-L4052> <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-06.md#L4672-L4690>.

### Notes
- This module now lives in the modular heuristic suite created on Nov 7; new WebForms patterns (master pages, user controls) should extend this builder instead of reintroducing bespoke checks inside the orchestrator <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-07.md#L760-L840> <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-07.md#L820-L900>.
- Keep the fixture-driven expectations in sync with `tests/integration/benchmarks/fixtures/csharp/webforms/**`; regenerate the oracle after adjusting heuristics to ensure the hidden-field → JS ripple still scores correctly <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-06.md#L4028-L4052>.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-05T15:37:25.274Z","inputHash":"a680e4dd437c5a1c"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `createWebFormsHeuristic` {#symbol-createwebformsheuristic}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/inference/heuristics/webforms.ts#L19)
- Returns: [`FallbackHeuristic`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-fallbackheuristic)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path` - `path`
- [`fallbackHeuristicTypes.FallbackHeuristic`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-fallbackheuristic) (type-only)
- [`fallbackHeuristicTypes.HeuristicArtifact`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-heuristicartifact) (type-only)
- [`artifactLayerUtils.isImplementationLayer`](./artifactLayerUtils.ts.mdmd.md#symbol-isimplementationlayer)
- [`shared.isExternalLink`](./shared.ts.mdmd.md#symbol-isexternallink)
- [`shared.normalizePath`](./shared.ts.mdmd.md#symbol-normalizepath)
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
