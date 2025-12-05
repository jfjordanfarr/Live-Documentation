# packages/shared/src/inference/llm/confidenceCalibrator.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/inference/llm/confidenceCalibrator.ts
- Live Doc ID: LD-implementation-packages-shared-src-inference-llm-confidencecalibrator-ts
- Generated At: 2025-12-05T04:16:19.640Z

## Authored
### Purpose
Buckets raw model confidences into the discrete `high`/`medium`/`low` tiers we planned for the LLM ingestion pipeline so graph diagnostics can key off categorical strength instead of opaque floats <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-24.md#L1782-L1809> <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-24.md#L3122-L3160>.

### Notes
- The thresholds and `rawConfidenceLabel` hand-back keep orchestrator tests green and preserve provenance for review tooling—update them in lockstep with prompt or analytics changes <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-24.md#L3122-L3160> <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-24.md#L6095-L6132>.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-05T04:16:19.640Z","inputHash":"ffe97d7ab87aba65"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ConfidenceTier` {#symbol-confidencetier}
- Type: type
- Source: [source](../../../../../../../packages/shared/src/inference/llm/confidenceCalibrator.ts#L3)

#### `CalibratedRelationship` {#symbol-calibratedrelationship}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/inference/llm/confidenceCalibrator.ts#L5)
- Extends: `RawRelationshipCandidate`

#### `CalibrationContext` {#symbol-calibrationcontext}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/inference/llm/confidenceCalibrator.ts#L14)

#### `calibrateConfidence` {#symbol-calibrateconfidence}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/inference/llm/confidenceCalibrator.ts#L35)
- Returns: `CalibratedRelationship`[]
- Parameters: `candidates`: `RawRelationshipCandidate`[]; `context`: `CalibrationContext`
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`relationshipExtractor.RawRelationshipCandidate`](./relationshipExtractor.ts.mdmd.md#symbol-rawrelationshipcandidate) (type-only)
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
<!-- LIVE-DOC:END Observed Evidence -->
