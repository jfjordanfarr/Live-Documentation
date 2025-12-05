# packages/shared/src/tooling/ollamaMock.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/tooling/ollamaMock.ts
- Live Doc ID: LD-implementation-packages-shared-src-tooling-ollamamock-ts
- Generated At: 2025-12-05T04:16:20.252Z

## Authored
### Purpose
Provides a deterministic Ollama chat payload so the extension and CLI can fall back gracefully when no local model is available ([Local Ollama Bridge rollout](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-29.md#L1106-L1112)).

### Notes
- Supplies the JSON echo/rationale block consumed by `invokeLocalOllamaBridge`, letting integration tests run without real `vscode.lm` registrations ([bridge summary](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-29.md#L1106-L1109)).
- Shared with `run-chat.ts` so both manual and automated flows report identical mock usage metadata instead of ad hoc CLI scaffolding ([bridge summary](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-29.md#L1109-L1112)).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-05T04:16:20.252Z","inputHash":"a65a6fc4268bad0d"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `MockOllamaResponse` {#symbol-mockollamaresponse}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/tooling/ollamaMock.ts#L6)

#### `CreateMockOllamaResponseOptions` {#symbol-createmockollamaresponseoptions}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/tooling/ollamaMock.ts#L12)

#### `createMockOllamaResponse` {#symbol-createmockollamaresponse}
- Type: function
- Source: [source](../../../../../../packages/shared/src/tooling/ollamaMock.ts#L17)
- Returns: `MockOllamaResponse`
- Parameters: `options`: `CreateMockOllamaResponseOptions`

#### `MOCK_OLLAMA_MODEL_ID` {#symbol-mock_ollama_model_id}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/tooling/ollamaMock.ts#L45)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`ollamaClient.OllamaChatUsage`](./ollamaClient.ts.mdmd.md#symbol-ollamachatusage) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [analyzeWithAI.test.ts](../../../extension/src/commands/analyzeWithAI.test.ts.mdmd.md)
- [exportDiagnostics.test.ts](../../../extension/src/commands/exportDiagnostics.test.ts.mdmd.md)
- [inspectSymbolNeighbors.test.ts](../../../extension/src/commands/inspectSymbolNeighbors.test.ts.mdmd.md)
- [dependencyQuickPick.test.ts](../../../extension/src/diagnostics/dependencyQuickPick.test.ts.mdmd.md)
- [docDiagnosticProvider.test.ts](../../../extension/src/diagnostics/docDiagnosticProvider.test.ts.mdmd.md)
- [localOllamaBridge.test.ts](../../../extension/src/services/localOllamaBridge.test.ts.mdmd.md)
- [symbolBridge.test.ts](../../../extension/src/services/symbolBridge.test.ts.mdmd.md)
- [saveCodeChange.test.ts](../../../server/src/features/changeEvents/saveCodeChange.test.ts.mdmd.md)
- [saveDocumentChange.test.ts](../../../server/src/features/changeEvents/saveDocumentChange.test.ts.mdmd.md)
- [inspectDependencies.test.ts](../../../server/src/features/dependencies/inspectDependencies.test.ts.mdmd.md)
- [symbolNeighbors.test.ts](../../../server/src/features/dependencies/symbolNeighbors.test.ts.mdmd.md)
- [acknowledgementService.test.ts](../../../server/src/features/diagnostics/acknowledgementService.test.ts.mdmd.md)
- [listOutstandingDiagnostics.test.ts](../../../server/src/features/diagnostics/listOutstandingDiagnostics.test.ts.mdmd.md)
- [noiseFilter.test.ts](../../../server/src/features/diagnostics/noiseFilter.test.ts.mdmd.md)
- [publishDocDiagnostics.test.ts](../../../server/src/features/diagnostics/publishDocDiagnostics.test.ts.mdmd.md)
- [feedFormatDetector.test.ts](../../../server/src/features/knowledge/feedFormatDetector.test.ts.mdmd.md)
- [knowledgeFeedManager.test.ts](../../../server/src/features/knowledge/knowledgeFeedManager.test.ts.mdmd.md)
- [knowledgeGraphBridge.test.ts](../../../server/src/features/knowledge/knowledgeGraphBridge.test.ts.mdmd.md)
- [knowledgeGraphIngestor.test.ts](../../../server/src/features/knowledge/knowledgeGraphIngestor.test.ts.mdmd.md)
- [llmIngestionOrchestrator.test.ts](../../../server/src/features/knowledge/llmIngestionOrchestrator.test.ts.mdmd.md)
- [lsifParser.test.ts](../../../server/src/features/knowledge/lsifParser.test.ts.mdmd.md)
- [rippleAnalyzer.test.ts](../../../server/src/features/knowledge/rippleAnalyzer.test.ts.mdmd.md)
- [scipParser.test.ts](../../../server/src/features/knowledge/scipParser.test.ts.mdmd.md)
- [workspaceIndexProvider.test.ts](../../../server/src/features/knowledge/workspaceIndexProvider.test.ts.mdmd.md)
- [artifactWatcher.test.ts](../../../server/src/features/watchers/artifactWatcher.test.ts.mdmd.md)
- [pathReferenceDetector.test.ts](../../../server/src/features/watchers/pathReferenceDetector.test.ts.mdmd.md)
- [environment.test.ts](../../../server/src/runtime/environment.test.ts.mdmd.md)
- [settings.test.ts](../../../server/src/runtime/settings.test.ts.mdmd.md)
- [latencyTracker.test.ts](../../../server/src/telemetry/latencyTracker.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
