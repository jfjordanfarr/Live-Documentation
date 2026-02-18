# packages/shared/src/inference/linkInference.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/inference/linkInference.ts
- Live Doc ID: LD-implementation-packages-shared-src-inference-linkinference-ts
- Generated At: 2026-02-18T18:15:12.616Z

## Authored
### Purpose

Implements the link inference orchestrator from US1 task T028, unifying fallback heuristics and workspace providers into deduplicated link evidence with provenance as documented in [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-17.md#L645](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-17.md#L645).

### Notes

The markdown watcher streams saved documents through this orchestrator to capture seeds and hints before diagnostics publish, per [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-21.md#L343](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-21.md#L343).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-18T18:15:12.616Z","inputHash":"957d0d75b822eef2"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LinkInferenceTraceOrigin` {#symbol-linkinferencetraceorigin}
- Type: type
- Source: [source](../../../../../../packages/shared/src/inference/linkInference.ts#L23)
- Returns: `WorkspaceProviderKind`, [`InferenceTraceEntry`](./fallbackInference.ts.mdmd.md#symbol-inferencetraceentry)

##### `LinkInferenceTraceOrigin` — Summary
Union of origins that can produce trace entries in the link-inference pipeline.

Extends the fallback engine's `InferenceTraceOrigin` with workspace-provider
origins that identify contributions from external data sources.

#### `LinkInferenceTraceEntry` {#symbol-linkinferencetraceentry}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/inference/linkInference.ts#L29)

##### `LinkInferenceTraceEntry` — Summary
Trace record produced by the link-inference orchestrator, documenting
how and why a relationship was inferred between two URIs.

#### `LinkEvidence` {#symbol-linkevidence}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/inference/linkInference.ts#L52)

##### `LinkEvidence` — Summary
A single piece of link evidence contributed by a workspace provider.

Evidence records let external data sources (e.g. a test-coverage bridge
or a git-co-change analyzer) inject relationships into the graph.

#### `WorkspaceLinkContribution` {#symbol-workspacelinkcontribution}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/inference/linkInference.ts#L74)

##### `WorkspaceLinkContribution` — Summary
Data contributed by a workspace link provider after collection.

Providers may supply additional seeds (new artifacts to track),
hints (relationship suggestions for the heuristic engine), and/or
evidences (fully formed link assertions).

#### `WorkspaceLinkProviderContext` {#symbol-workspacelinkprovidercontext}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/inference/linkInference.ts#L84)

##### `WorkspaceLinkProviderContext` — Summary
Context passed to workspace link providers during collection.

#### `WorkspaceLinkProvider` {#symbol-workspacelinkprovider}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/inference/linkInference.ts#L95)

##### `WorkspaceLinkProvider` — Summary
Extension point for injecting external link data into the inference pipeline.

Providers are invoked during orchestration and may emit seeds, hints,
and/or evidence records that augment the heuristic-derived graph.

#### `WorkspaceProviderSummary` {#symbol-workspaceprovidersummary}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/inference/linkInference.ts#L108)

##### `WorkspaceProviderSummary` — Summary
Summary statistics for a single workspace provider's contribution,
included in the orchestration result for observability.

#### `LinkInferenceRunInput` {#symbol-linkinferenceruninput}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/inference/linkInference.ts#L124)

##### `LinkInferenceRunInput` — Summary
Input for a single link-inference orchestration run.

#### `LinkInferenceError` {#symbol-linkinferenceerror}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/inference/linkInference.ts#L141)

##### `LinkInferenceError` — Summary
An error encountered during link inference, attributed to its source
subsystem (e.g. a failing workspace provider).

#### `LinkInferenceRunResult` {#symbol-linkinferencerunresult}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/inference/linkInference.ts#L153)

##### `LinkInferenceRunResult` — Summary
Complete result of a link-inference orchestration run.

#### `LinkInferenceOrchestrator` {#symbol-linkinferenceorchestrator}
- Type: class
- Source: [source](../../../../../../packages/shared/src/inference/linkInference.ts#L402)

##### `LinkInferenceOrchestrator` — Summary
Top-level orchestrator that combines the fallback heuristic engine,
workspace link providers, and direct evidence into a unified
{@link LinkInferenceRunResult}.

Pipeline:
1. Merge seeds and collect workspace provider contributions
2. Run the fallback heuristic engine ({@link inferFallbackGraph})
3. Apply provider evidence as additional links
4. Return deduplicated artifacts, links, traces, and errors
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`artifacts.KnowledgeArtifact`](../domain/artifacts.ts.mdmd.md#symbol-knowledgeartifact)
- [`artifacts.LinkRelationship`](../domain/artifacts.ts.mdmd.md#symbol-linkrelationship)
- [`artifacts.LinkRelationshipKind`](../domain/artifacts.ts.mdmd.md#symbol-linkrelationshipkind)
- [`fallbackInference.ArtifactSeed`](./fallbackInference.ts.mdmd.md#symbol-artifactseed)
- [`fallbackInference.InferenceTraceEntry`](./fallbackInference.ts.mdmd.md#symbol-inferencetraceentry)
- [`fallbackInference.RelationshipHint`](./fallbackInference.ts.mdmd.md#symbol-relationshiphint)
- [`fallbackInference.inferFallbackGraph`](./fallbackInference.ts.mdmd.md#symbol-inferfallbackgraph)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [linkInference.test.ts](./linkInference.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
