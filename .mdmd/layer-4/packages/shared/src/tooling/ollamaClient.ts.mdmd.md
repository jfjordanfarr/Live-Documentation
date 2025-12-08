# packages/shared/src/tooling/ollamaClient.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/tooling/ollamaClient.ts
- Live Doc ID: LD-implementation-packages-shared-src-tooling-ollamaclient-ts
- Generated At: 2025-12-07T21:41:19.622Z

## Authored
### Purpose
Implements the shared HTTP client for Ollama chat requests—handling timeouts, usage metrics, deterministic error surfaces, and optional tracing—so both the extension and CLI can invoke workspace-local models without bespoke fetch logic ([bridge plan](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-29.md#L695-L757), [runtime hardening](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-29.md#L5520-L5530)).

### Notes
- Exposed via `@copilot-improvement/shared` and used by `invokeLocalOllamaBridge` plus `scripts/ollama/run-chat.ts`, giving the extension, integration harness, and tooling identical retry/trace behaviour ([runtime hardening](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-29.md#L5520-L5530)).
- Captures raw responses and timing data into per-run traces when `LINK_AWARE_OLLAMA_TRACE_DIR` is set, supporting the telemetry/benchmark reporting workstream called out during the rollout ([runtime hardening](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-29.md#L5520-L5530)).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-07T21:41:19.622Z","inputHash":"75e18e48dcde9ac5"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `OllamaChatRequest` {#symbol-ollamachatrequest}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/tooling/ollamaClient.ts#L5)

#### `OllamaChatUsage` {#symbol-ollamachatusage}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/tooling/ollamaClient.ts#L15)

#### `OllamaChatResult` {#symbol-ollamachatresult}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/tooling/ollamaClient.ts#L21)

#### `OllamaInvocationError` {#symbol-ollamainvocationerror}
- Type: class
- Source: [source](../../../../../../packages/shared/src/tooling/ollamaClient.ts#L38)

#### `invokeOllamaChat` {#symbol-invokeollamachat}
- Type: function
- Source: [source](../../../../../../packages/shared/src/tooling/ollamaClient.ts#L45)
- Parameters: `request`: [`OllamaChatRequest`](#symbol-ollamachatrequest)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:crypto` - `randomUUID`
- `node:fs` - `promises`
- `node:path` - `path`
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
