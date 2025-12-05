# packages/shared/src/inference/linkInference.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/inference/linkInference.ts
- Live Doc ID: LD-implementation-packages-shared-src-inference-linkinference-ts
- Generated At: 2025-12-05T04:16:19.620Z

## Authored
### Purpose
Implements the link inference orchestrator from US1 task T028, unifying fallback heuristics, workspace providers, and knowledge feeds into deduplicated link evidence with provenance as documented in [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-17.md#L645](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-17.md#L645).

### Notes
The markdown watcher streams saved documents through this orchestrator to capture seeds and hints before diagnostics publish, per [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-21.md#L343](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-21.md#L343), and later work plans to route its output into the live knowledge feed manager under the guarded ingestion roadmap in [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-26.md#L1306](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-26.md#L1306).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-05T04:16:19.620Z","inputHash":"73e30b6a29426197"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LinkInferenceTraceOrigin` {#symbol-linkinferencetraceorigin}
- Type: type
- Source: [source](../../../../../../packages/shared/src/inference/linkInference.ts#L26)
- Returns: `WorkspaceProviderKind`, `KnowledgeFeedKind`, `InferenceTraceEntry`

#### `LinkInferenceTraceEntry` {#symbol-linkinferencetraceentry}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/inference/linkInference.ts#L28)

#### `LinkEvidence` {#symbol-linkevidence}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/inference/linkInference.ts#L38)

#### `WorkspaceLinkContribution` {#symbol-workspacelinkcontribution}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/inference/linkInference.ts#L47)

#### `WorkspaceLinkProviderContext` {#symbol-workspacelinkprovidercontext}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/inference/linkInference.ts#L53)

#### `WorkspaceLinkProvider` {#symbol-workspacelinkprovider}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/inference/linkInference.ts#L57)

#### `WorkspaceProviderSummary` {#symbol-workspaceprovidersummary}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/inference/linkInference.ts#L63)

#### `KnowledgeFeedSnapshotSource` {#symbol-knowledgefeedsnapshotsource}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/inference/linkInference.ts#L71)

#### `KnowledgeFeedStreamSource` {#symbol-knowledgefeedstreamsource}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/inference/linkInference.ts#L76)

#### `KnowledgeFeed` {#symbol-knowledgefeed}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/inference/linkInference.ts#L81)

#### `KnowledgeFeedSummary` {#symbol-knowledgefeedsummary}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/inference/linkInference.ts#L87)

#### `LinkInferenceRunInput` {#symbol-linkinferenceruninput}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/inference/linkInference.ts#L95)

#### `LinkInferenceError` {#symbol-linkinferenceerror}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/inference/linkInference.ts#L106)

#### `LinkInferenceRunResult` {#symbol-linkinferencerunresult}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/inference/linkInference.ts#L112)

#### `LinkInferenceOrchestrator` {#symbol-linkinferenceorchestrator}
- Type: class
- Source: [source](../../../../../../packages/shared/src/inference/linkInference.ts#L386)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`artifacts.KnowledgeArtifact`](../domain/artifacts.ts.mdmd.md#symbol-knowledgeartifact)
- [`artifacts.LinkRelationship`](../domain/artifacts.ts.mdmd.md#symbol-linkrelationship)
- [`artifacts.LinkRelationshipKind`](../domain/artifacts.ts.mdmd.md#symbol-linkrelationshipkind)
- [`fallbackInference.ArtifactSeed`](./fallbackInference.ts.mdmd.md#symbol-artifactseed)
- [`fallbackInference.FallbackLLMBridge`](./fallbackInference.ts.mdmd.md#symbol-fallbackllmbridge)
- [`fallbackInference.InferenceTraceEntry`](./fallbackInference.ts.mdmd.md#symbol-inferencetraceentry)
- [`fallbackInference.RelationshipHint`](./fallbackInference.ts.mdmd.md#symbol-relationshiphint)
- [`fallbackInference.inferFallbackGraph`](./fallbackInference.ts.mdmd.md#symbol-inferfallbackgraph)
- [`knowledgeGraphBridge.ExternalArtifact`](../knowledge/knowledgeGraphBridge.ts.mdmd.md#symbol-externalartifact) (type-only)
- [`knowledgeGraphBridge.ExternalLink`](../knowledge/knowledgeGraphBridge.ts.mdmd.md#symbol-externallink) (type-only)
- [`knowledgeGraphBridge.ExternalSnapshot`](../knowledge/knowledgeGraphBridge.ts.mdmd.md#symbol-externalsnapshot) (type-only)
- [`knowledgeGraphBridge.ExternalStreamEvent`](../knowledge/knowledgeGraphBridge.ts.mdmd.md#symbol-externalstreamevent) (type-only)
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
- [linkInference.test.ts](./linkInference.test.ts.mdmd.md)
- [relationshipRuleProvider.test.ts](../rules/relationshipRuleProvider.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
