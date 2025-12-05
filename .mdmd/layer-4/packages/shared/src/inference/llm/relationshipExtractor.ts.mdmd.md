# packages/shared/src/inference/llm/relationshipExtractor.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/inference/llm/relationshipExtractor.ts
- Live Doc ID: LD-implementation-packages-shared-src-inference-llm-relationshipextractor-ts
- Generated At: 2025-12-05T04:16:19.652Z

## Authored
### Purpose
Normalizes LLM prompt responses into validated relationship batches so the ingestion orchestrator can persist or preview link edges without trusting raw JSON straight from the model <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-24.md#L1782-L1794> <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-24.md#L6944-L6954>.

### Notes
- The dry-run harness and `llmIngestionOrchestrator` tests assert that this extractor raises on malformed payloads and records provenance for calibrated relationships—keep that contract intact when evolving the schema <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-24.md#L3122-L3160>.
- We intentionally ship with a stub model invoker (logs once, yields empty relationships) to let the change processor exercise ingestion without mutating the graph; replace it only alongside real `vscode.lm` wiring and updated fixtures <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-24.md#L6944-L6954>.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-05T04:16:19.652Z","inputHash":"7d25b94f547c9182"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ConfidenceTier` {#symbol-confidencetier}
- Type: type
- Source: [source](../../../../../../../packages/shared/src/inference/llm/relationshipExtractor.ts#L3)

#### `RelationshipExtractionPrompt` {#symbol-relationshipextractionprompt}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/inference/llm/relationshipExtractor.ts#L5)

#### `ModelInvocationRequest` {#symbol-modelinvocationrequest}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/inference/llm/relationshipExtractor.ts#L13)

#### `ModelUsage` {#symbol-modelusage}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/inference/llm/relationshipExtractor.ts#L19)

#### `ModelInvocationResult` {#symbol-modelinvocationresult}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/inference/llm/relationshipExtractor.ts#L25)

#### `ModelInvoker` {#symbol-modelinvoker}
- Type: type
- Source: [source](../../../../../../../packages/shared/src/inference/llm/relationshipExtractor.ts#L31)
- Parameters: `request`: `ModelInvocationRequest`

#### `RelationshipExtractionRequest` {#symbol-relationshipextractionrequest}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/inference/llm/relationshipExtractor.ts#L33)

#### `RawRelationshipCandidate` {#symbol-rawrelationshipcandidate}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/inference/llm/relationshipExtractor.ts#L39)

#### `RelationshipExtractionBatch` {#symbol-relationshipextractionbatch}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/inference/llm/relationshipExtractor.ts#L49)

#### `RelationshipExtractorOptions` {#symbol-relationshipextractoroptions}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/inference/llm/relationshipExtractor.ts#L59)

#### `RelationshipExtractorLogger` {#symbol-relationshipextractorlogger}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/inference/llm/relationshipExtractor.ts#L64)

#### `RelationshipExtractorError` {#symbol-relationshipextractorerror}
- Type: class
- Source: [source](../../../../../../../packages/shared/src/inference/llm/relationshipExtractor.ts#L69)

#### `RelationshipExtractor` {#symbol-relationshipextractor}
- Type: class
- Source: [source](../../../../../../../packages/shared/src/inference/llm/relationshipExtractor.ts#L75)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`artifacts.LinkRelationshipKind`](../../domain/artifacts.ts.mdmd.md#symbol-linkrelationshipkind) (type-only)
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
- [confidenceCalibrator.test.ts](./confidenceCalibrator.test.ts.mdmd.md)
- [relationshipExtractor.test.ts](./relationshipExtractor.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
