# packages/shared/src/inference/heuristics/index.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/inference/heuristics/index.ts
- Live Doc ID: LD-implementation-packages-shared-src-inference-heuristics-index-ts
- Generated At: 2025-12-05T15:37:25.203Z

## Authored
### Purpose
Turns the per-language builders into the default heuristic suite that replaced the monolithic fallbackInference orchestrator on Nov 7, giving the pipeline a single place to register ordering and hydration logic <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-07.md#L760-L840> <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-07.SUMMARIZED.md#L50-L70>.

### Notes
- Maintain the evaluation order here—directive/docs first, then language heuristics—so we preserve the confidence balancing discussed during the modular refactor; shuffle only with a benchmark-backed justification <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-07.md#L1290-L1485>.
- When adding a new heuristic module, export it through this registry and update `fallbackInference.languages.test.ts` so the regression suite exercises the new behavior <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-07.md#L600-L676>.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-05T15:37:25.203Z","inputHash":"1647f5b8d8b6b80d"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `createDefaultHeuristics` {#symbol-createdefaultheuristics}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/inference/heuristics/index.ts#L14)
- Returns: [`FallbackHeuristic`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-fallbackheuristic)[]
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`fallbackHeuristicTypes.FallbackHeuristic`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-fallbackheuristic) (type-only)
- [`cFunctions.createCFunctionHeuristic`](./cFunctions.ts.mdmd.md#symbol-createcfunctionheuristic)
- [`csharp.createCSharpHeuristic`](./csharp.ts.mdmd.md#symbol-createcsharpheuristic)
- [`directives.createDirectiveHeuristic`](./directives.ts.mdmd.md#symbol-createdirectiveheuristic)
- [`imports.createImportHeuristic`](./imports.ts.mdmd.md#symbol-createimportheuristic)
- [`includes.createIncludeHeuristic`](./includes.ts.mdmd.md#symbol-createincludeheuristic)
- [`java.createJavaHeuristic`](./java.ts.mdmd.md#symbol-createjavaheuristic)
- [`markdown.createMarkdownHeuristic`](./markdown.ts.mdmd.md#symbol-createmarkdownheuristic)
- [`powershell.createPowerShellHeuristic`](./powershell.ts.mdmd.md#symbol-createpowershellheuristic)
- [`ruby.createRubyHeuristic`](./ruby.ts.mdmd.md#symbol-createrubyheuristic)
- [`rust.createRustHeuristic`](./rust.ts.mdmd.md#symbol-createrustheuristic)
- [`webforms.createWebFormsHeuristic`](./webforms.ts.mdmd.md#symbol-createwebformsheuristic)
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
