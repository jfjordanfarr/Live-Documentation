# packages/shared/src/inference/linkInference.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/inference/linkInference.ts
- Live Doc ID: LD-implementation-packages-shared-src-inference-linkinference-ts
- Generated At: 2026-01-13T18:30:45.352Z

## Authored
### Purpose
Implements the link inference orchestrator from US1 task T028, unifying fallback heuristics and workspace providers into deduplicated link evidence with provenance as documented in [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-17.md#L645](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-17.md#L645).

### Notes
The markdown watcher streams saved documents through this orchestrator to capture seeds and hints before diagnostics publish, per [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-21.md#L343](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-21.md#L343).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-13T18:30:45.352Z","inputHash":"6eccc2d3b83cc06a"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LinkInferenceTraceOrigin` {#symbol-linkinferencetraceorigin}
- Type: type
- Source: [source](../../../../../../packages/shared/src/inference/linkInference.ts#L18)
- Returns: `WorkspaceProviderKind`, [`InferenceTraceEntry`](./fallbackInference.ts.mdmd.md#symbol-inferencetraceentry)

#### `LinkInferenceTraceEntry` {#symbol-linkinferencetraceentry}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/inference/linkInference.ts#L20)

#### `LinkEvidence` {#symbol-linkevidence}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/inference/linkInference.ts#L30)

#### `WorkspaceLinkContribution` {#symbol-workspacelinkcontribution}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/inference/linkInference.ts#L39)

#### `WorkspaceLinkProviderContext` {#symbol-workspacelinkprovidercontext}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/inference/linkInference.ts#L45)

#### `WorkspaceLinkProvider` {#symbol-workspacelinkprovider}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/inference/linkInference.ts#L49)

#### `WorkspaceProviderSummary` {#symbol-workspaceprovidersummary}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/inference/linkInference.ts#L55)

#### `LinkInferenceRunInput` {#symbol-linkinferenceruninput}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/inference/linkInference.ts#L63)

#### `LinkInferenceError` {#symbol-linkinferenceerror}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/inference/linkInference.ts#L73)

#### `LinkInferenceRunResult` {#symbol-linkinferencerunresult}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/inference/linkInference.ts#L79)

#### `LinkInferenceOrchestrator` {#symbol-linkinferenceorchestrator}
- Type: class
- Source: [source](../../../../../../packages/shared/src/inference/linkInference.ts#L312)
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
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [linkInference.test.ts](./linkInference.test.ts.mdmd.md)
- [relationshipRuleProvider.test.ts](../rules/relationshipRuleProvider.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
