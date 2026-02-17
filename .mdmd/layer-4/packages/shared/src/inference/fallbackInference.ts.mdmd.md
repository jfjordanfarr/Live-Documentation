# packages/shared/src/inference/fallbackInference.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/inference/fallbackInference.ts
- Live Doc ID: LD-implementation-packages-shared-src-inference-fallbackinference-ts
- Generated At: 2026-02-17T21:05:03.150Z

## Authored
### Purpose
Implements the cross-language fallback inference pipeline—seed normalization, heuristic matching, and LLM-assisted hints—that delivered SpecKit tasks T054–T056 in [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-17.SUMMARIZED.md#turn-6-resume-speckitimplement-lines-164-286](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-17.SUMMARIZED.md#turn-6-resume-speckitimplement-lines-164-286).

### Notes
Subsequent passes layered in AST-backed type filtering and deeper language heuristics—see [AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-03.SUMMARIZED.md#turn-17-shareable-typescript-ast-utilities-lines-1461-1620](../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-03.SUMMARIZED.md#turn-17-shareable-typescript-ast-utilities-lines-1461-1620) for the TypeScript runtime/type split and [AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-06.SUMMARIZED.md#turn-26-benchmarks-fail-on-new-c-fixtures-lines-4121-4520](../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-06.SUMMARIZED.md#turn-26-benchmarks-fail-on-new-c-fixtures-lines-4121-4520) for the C#/WebForms heuristics that stabilized benchmark precision.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-17T21:05:03.150Z","inputHash":"7ca4c42ffc8aab7b"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ArtifactSeed` {#symbol-artifactseed}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/inference/fallbackInference.ts#L21)

##### `ArtifactSeed` — Summary
Seed data for a single workspace artifact before relationship inference.

Seeds are the raw inputs from which {@link inferFallbackGraph} builds
{@link KnowledgeArtifact} instances and discovers relationships via
heuristic matching and user-supplied hints.

#### `RelationshipHint` {#symbol-relationshiphint}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/inference/fallbackInference.ts#L40)

##### `RelationshipHint` — Summary
A user-supplied or externally-derived relationship hint between two artifacts.

Hints are treated as high-confidence edges during fallback inference and
bypass heuristic matching. They're typically derived from configuration
files or manual overrides.

#### `FallbackGraphInput` {#symbol-fallbackgraphinput}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/inference/fallbackInference.ts#L55)

##### `FallbackGraphInput` — Summary
Input bundle for {@link inferFallbackGraph}: the set of artifact seeds
to analyze plus optional pre-existing relationship hints and a content
provider for reading file bodies on demand.

#### `FallbackGraphOptions` {#symbol-fallbackgraphoptions}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/inference/fallbackInference.ts#L66)

##### `FallbackGraphOptions` — Summary
Configuration options for {@link inferFallbackGraph}.

##### `FallbackGraphOptions` — Additional Documentation
- @property now - Clock factory for deterministic timestamps in tests.

#### `InferenceTraceOrigin` {#symbol-inferencetraceorigin}
- Type: type
- Source: [source](../../../../../../packages/shared/src/inference/fallbackInference.ts#L71)

##### `InferenceTraceOrigin` — Summary
Discriminator indicating how a relationship was discovered.

#### `InferenceTraceEntry` {#symbol-inferencetraceentry}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/inference/fallbackInference.ts#L78)

##### `InferenceTraceEntry` — Summary
Audit record for a single inferred relationship, capturing provenance
(heuristic ID or hint source) for the benchmark/report pipeline to
evaluate precision and recall.

#### `FallbackInferenceResult` {#symbol-fallbackinferenceresult}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/inference/fallbackInference.ts#L94)

##### `FallbackInferenceResult` — Summary
Complete output of {@link inferFallbackGraph}: the resolved artifact
graph, inferred link relationships, and per-link audit traces.

#### `inferFallbackGraph` {#symbol-inferfallbackgraph}
- Type: function
- Source: [source](../../../../../../packages/shared/src/inference/fallbackInference.ts#L122)
- Parameters: `input`: [`FallbackGraphInput`](#symbol-fallbackgraphinput); `options`: [`FallbackGraphOptions`](#symbol-fallbackgraphoptions)

##### `inferFallbackGraph` — Summary
Core fallback inference engine: builds a {@link KnowledgeArtifact} graph
from seed data, discovers relationships via path/naming heuristics, and
incorporates user-supplied hints.

This is the primary entry point for the link-aware diagnostics pipeline
when SCIP indexes are unavailable (most polyglot workspaces). Results
feed the benchmark suite, the graph snapshot CLI, and the Live Docs
dependency sections.

##### `inferFallbackGraph` — Parameters
- `input`: Artifact seeds, optional hints, and content provider.
- `options`: Tuning knobs (clock factory for tests).

##### `inferFallbackGraph` — Returns
Resolved artifacts, inferred links, and audit traces.
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
<!-- LIVE-DOC:END Observed Evidence -->
