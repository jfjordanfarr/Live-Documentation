# packages/shared/src/inference/linkInference.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/inference/linkInference.ts
- Live Doc ID: LD-implementation-packages-shared-src-inference-linkinference-ts
- Generated At: 2026-01-12T21:24:48.765Z

## Authored
### Purpose
Implements the link inference orchestrator from US1 task T028, unifying fallback heuristics, workspace providers, and knowledge feeds into deduplicated link evidence with provenance as documented in [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-17.md#L645](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-17.md#L645).

### Notes
The markdown watcher streams saved documents through this orchestrator to capture seeds and hints before diagnostics publish, per [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-21.md#L343](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-21.md#L343), and later work plans to route its output into the live knowledge feed manager under the guarded ingestion roadmap in [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-26.md#L1306](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-26.md#L1306).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-12T21:24:48.765Z","inputHash":"332e335bcc66122e"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LinkInferenceTraceOrigin` {#symbol-linkinferencetraceorigin}
- Type: type
- Source: [source](../../../../../../packages/shared/src/inference/linkInference.ts#L26)
- Returns: `WorkspaceProviderKind`, `KnowledgeFeedKind`, [`InferenceTraceEntry`](./fallbackInference.ts.mdmd.md#symbol-inferencetraceentry)

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
- [`externalTypes.ExternalArtifact`](../knowledge/externalTypes.ts.mdmd.md#symbol-externalartifact) (type-only)
- [`externalTypes.ExternalLink`](../knowledge/externalTypes.ts.mdmd.md#symbol-externallink) (type-only)
- [`externalTypes.ExternalSnapshot`](../knowledge/externalTypes.ts.mdmd.md#symbol-externalsnapshot) (type-only)
- [`externalTypes.ExternalStreamEvent`](../knowledge/externalTypes.ts.mdmd.md#symbol-externalstreamevent) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [linkInference.test.ts](./linkInference.test.ts.mdmd.md)
- [relationshipRuleProvider.test.ts](../rules/relationshipRuleProvider.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
