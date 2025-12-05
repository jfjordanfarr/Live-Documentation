# packages/shared/src/inference/fallbackInference.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/inference/fallbackInference.ts
- Live Doc ID: LD-implementation-packages-shared-src-inference-fallbackinference-ts
- Generated At: 2025-12-05T04:16:19.488Z

## Authored
### Purpose
Implements the cross-language fallback inference pipeline—seed normalization, heuristic matching, and LLM-assisted hints—that delivered SpecKit tasks T054–T056 in [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-17.SUMMARIZED.md#turn-6-resume-speckitimplement-lines-164-286](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-17.SUMMARIZED.md#turn-6-resume-speckitimplement-lines-164-286).

### Notes
Subsequent passes layered in AST-backed type filtering and deeper language heuristics—see [AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-03.SUMMARIZED.md#turn-17-shareable-typescript-ast-utilities-lines-1461-1620](../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-03.SUMMARIZED.md#turn-17-shareable-typescript-ast-utilities-lines-1461-1620) for the TypeScript runtime/type split and [AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-06.SUMMARIZED.md#turn-26-benchmarks-fail-on-new-c-fixtures-lines-4121-4520](../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-06.SUMMARIZED.md#turn-26-benchmarks-fail-on-new-c-fixtures-lines-4121-4520) for the C#/WebForms heuristics that stabilized benchmark precision.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-05T04:16:19.488Z","inputHash":"699cbb1d5faafbe7"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ArtifactSeed` {#symbol-artifactseed}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/inference/fallbackInference.ts#L14)

#### `RelationshipHint` {#symbol-relationshiphint}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/inference/fallbackInference.ts#L26)

#### `LLMRelationshipSuggestion` {#symbol-llmrelationshipsuggestion}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/inference/fallbackInference.ts#L36)

#### `LLMRelationshipRequest` {#symbol-llmrelationshiprequest}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/inference/fallbackInference.ts#L44)

#### `FallbackLLMBridge` {#symbol-fallbackllmbridge}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/inference/fallbackInference.ts#L51)

#### `FallbackGraphInput` {#symbol-fallbackgraphinput}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/inference/fallbackInference.ts#L56)

#### `FallbackGraphOptions` {#symbol-fallbackgraphoptions}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/inference/fallbackInference.ts#L62)

#### `InferenceTraceOrigin` {#symbol-inferencetraceorigin}
- Type: type
- Source: [source](../../../../../../packages/shared/src/inference/fallbackInference.ts#L68)

#### `InferenceTraceEntry` {#symbol-inferencetraceentry}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/inference/fallbackInference.ts#L70)

#### `FallbackInferenceResult` {#symbol-fallbackinferenceresult}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/inference/fallbackInference.ts#L82)

#### `inferFallbackGraph` {#symbol-inferfallbackgraph}
- Type: function
- Source: [source](../../../../../../packages/shared/src/inference/fallbackInference.ts#L97)
- Parameters: `input`: `FallbackGraphInput`; `options`: `FallbackGraphOptions`
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path` - `path`
- [`artifacts.ArtifactLayer`](../domain/artifacts.ts.mdmd.md#symbol-artifactlayer) (type-only)
- [`artifacts.KnowledgeArtifact`](../domain/artifacts.ts.mdmd.md#symbol-knowledgeartifact) (type-only)
- [`artifacts.LinkRelationship`](../domain/artifacts.ts.mdmd.md#symbol-linkrelationship) (type-only)
- [`artifacts.LinkRelationshipKind`](../domain/artifacts.ts.mdmd.md#symbol-linkrelationshipkind) (type-only)
- [`fallbackHeuristicTypes.HeuristicArtifact`](./fallbackHeuristicTypes.ts.mdmd.md#symbol-heuristicartifact) (type-only)
- [`fallbackHeuristicTypes.MatchCandidate`](./fallbackHeuristicTypes.ts.mdmd.md#symbol-matchcandidate) (type-only)
- [`fallbackHeuristicTypes.MatchContext`](./fallbackHeuristicTypes.ts.mdmd.md#symbol-matchcontext) (type-only)
- [`artifactLayerUtils.isDocumentLayer`](./heuristics/artifactLayerUtils.ts.mdmd.md#symbol-isdocumentlayer)
- [`artifactLayerUtils.isImplementationLayer`](./heuristics/artifactLayerUtils.ts.mdmd.md#symbol-isimplementationlayer)
- [`index.createDefaultHeuristics`](./heuristics/index.ts.mdmd.md#symbol-createdefaultheuristics)
- [`shared.stem`](./heuristics/shared.ts.mdmd.md#symbol-stem)
- [`shared.toComparablePath`](./heuristics/shared.ts.mdmd.md#symbol-tocomparablepath)
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
- [fallbackInference.languages.test.ts](./fallbackInference.languages.test.ts.mdmd.md)
- [fallbackInference.test.ts](./fallbackInference.test.ts.mdmd.md)
- [linkInference.test.ts](./linkInference.test.ts.mdmd.md)
- [relationshipRuleProvider.test.ts](../rules/relationshipRuleProvider.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
