# packages/shared/src/inference/fallbackInference.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/inference/fallbackInference.ts
- Live Doc ID: LD-implementation-packages-shared-src-inference-fallbackinference-ts
- Generated At: 2026-02-03T21:55:38.702Z

## Authored
### Purpose
Implements the cross-language fallback inference pipeline—seed normalization, heuristic matching, and LLM-assisted hints—that delivered SpecKit tasks T054–T056 in [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-17.SUMMARIZED.md#turn-6-resume-speckitimplement-lines-164-286](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-17.SUMMARIZED.md#turn-6-resume-speckitimplement-lines-164-286).

### Notes
Subsequent passes layered in AST-backed type filtering and deeper language heuristics—see [AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-03.SUMMARIZED.md#turn-17-shareable-typescript-ast-utilities-lines-1461-1620](../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-03.SUMMARIZED.md#turn-17-shareable-typescript-ast-utilities-lines-1461-1620) for the TypeScript runtime/type split and [AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-06.SUMMARIZED.md#turn-26-benchmarks-fail-on-new-c-fixtures-lines-4121-4520](../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-06.SUMMARIZED.md#turn-26-benchmarks-fail-on-new-c-fixtures-lines-4121-4520) for the C#/WebForms heuristics that stabilized benchmark precision.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:38.702Z","inputHash":"20a481477518fc82"}]} -->
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
- Parameters: `input`: [`FallbackGraphInput`](#symbol-fallbackgraphinput); `options`: [`FallbackGraphOptions`](#symbol-fallbackgraphoptions)
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
- [symbolBridge.test.ts](../../../extension/src/services/symbolBridge.test.ts.mdmd.md)
- [noiseFilter.test.ts](../../../server/src/features/diagnostics/noiseFilter.test.ts.mdmd.md)
- [pathReferenceDetector.test.ts](../../../server/src/features/watchers/pathReferenceDetector.test.ts.mdmd.md)
- [fallbackInference.languages.test.ts](./fallbackInference.languages.test.ts.mdmd.md)
- [fallbackInference.test.ts](./fallbackInference.test.ts.mdmd.md)
- [linkInference.test.ts](./linkInference.test.ts.mdmd.md)
- [relationshipRuleProvider.test.ts](../rules/relationshipRuleProvider.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
