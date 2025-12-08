# packages/shared/src/tooling/ollamaEndpoint.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/tooling/ollamaEndpoint.ts
- Live Doc ID: LD-implementation-packages-shared-src-tooling-ollamaendpoint-ts
- Generated At: 2025-12-07T21:41:19.626Z

## Authored
### Purpose
Resolves the workspace Ollama endpoint with a shared precedence stack (env vars → VS Code `github.copilot.chat.byok.ollamaEndpoint` → explicit fallback → localhost) so the local bridge and CLI talk to the same server when powering Link-Aware Diagnostics runs ([implementation phases](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-29.md#L732-L756), [Local Ollama Bridge rollout](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-29.md#L1106-L1112)).

### Notes
- Exported through `@copilot-improvement/shared` and consumed by `invokeLocalOllamaBridge` plus the `scripts/ollama/run-chat.ts` harness to keep extension, CLI, and integration workflows aligned on endpoint selection ([rollout summary](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-29.md#L1106-L1112)).
- Captures the VS Code setting uncovered during design (`github.copilot.chat.byok.ollamaEndpoint`) while preserving a deterministic `http://localhost:11434` default when no overrides exist ([design shard](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-29.md#L693-L704)).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-07T21:41:19.626Z","inputHash":"003d7cc67f85ae26"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ResolveOllamaEndpointOptions` {#symbol-resolveollamaendpointoptions}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/tooling/ollamaEndpoint.ts#L3)

#### `WorkspaceConfigurationLike` {#symbol-workspaceconfigurationlike}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/tooling/ollamaEndpoint.ts#L9)

#### `resolveOllamaEndpoint` {#symbol-resolveollamaendpoint}
- Type: function
- Source: [source](../../../../../../packages/shared/src/tooling/ollamaEndpoint.ts#L21)
- Parameters: `options`: [`ResolveOllamaEndpointOptions`](#symbol-resolveollamaendpointoptions)

##### `resolveOllamaEndpoint` — Summary
Resolve the Ollama endpoint that Link-Aware Diagnostics should talk to.
Priority order:
1. Explicit environment variables (`LINK_AWARE_OLLAMA_ENDPOINT`, `OLLAMA_ENDPOINT`).
2. VS Code setting `github.copilot.chat.byok.ollamaEndpoint` (if configuration is provided).
3. Callers may supply a custom fallback endpoint.
4. Default to `http://localhost:11434`.

#### `DEFAULT_OLLAMA_ENDPOINT` {#symbol-default_ollama_endpoint}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/tooling/ollamaEndpoint.ts#L60)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
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
