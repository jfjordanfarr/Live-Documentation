# packages/shared/src/knowledge/knowledgeGraphBridge.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/knowledge/knowledgeGraphBridge.ts
- Live Doc ID: LD-implementation-packages-shared-src-knowledge-knowledgegraphbridge-ts
- Generated At: 2025-12-11T02:38:01.837Z

## Authored
### Purpose
Provides the shared bridge that normalises external knowledge snapshots and streaming events into GraphStore artifacts/links, fulfilling the October 21 ingestion requirement captured in [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-21.md#L194](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-21.md#L194).

### Notes
The server wiring on October 20 relies on this bridge to bootstrap feeds from `data/knowledge-feeds/bootstrap.json`, so updates here should stay aligned with that runtime pipeline—see [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-20.md#L2334](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-20.md#L2334) for the operational walkthrough.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-11T02:38:01.837Z","inputHash":"9bbbf7ce041106b2"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ExternalArtifact` {#symbol-externalartifact}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/knowledge/knowledgeGraphBridge.ts#L10)

#### `ExternalLink` {#symbol-externallink}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/knowledge/knowledgeGraphBridge.ts#L21)

#### `ExternalSnapshot` {#symbol-externalsnapshot}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/knowledge/knowledgeGraphBridge.ts#L32)

#### `StreamEventKind` {#symbol-streameventkind}
- Type: type
- Source: [source](../../../../../../packages/shared/src/knowledge/knowledgeGraphBridge.ts#L41)

#### `ExternalStreamEvent` {#symbol-externalstreamevent}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/knowledge/knowledgeGraphBridge.ts#L47)

#### `StreamCheckpoint` {#symbol-streamcheckpoint}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/knowledge/knowledgeGraphBridge.ts#L58)

#### `KnowledgeGraphBridge` {#symbol-knowledgegraphbridge}
- Type: class
- Source: [source](../../../../../../packages/shared/src/knowledge/knowledgeGraphBridge.ts#L63)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`graphStore.GraphStore`](../db/graphStore.ts.mdmd.md#symbol-graphstore)
- [`artifacts.ArtifactLayer`](../domain/artifacts.ts.mdmd.md#symbol-artifactlayer)
- [`artifacts.KnowledgeArtifact`](../domain/artifacts.ts.mdmd.md#symbol-knowledgeartifact)
- [`artifacts.KnowledgeSnapshot`](../domain/artifacts.ts.mdmd.md#symbol-knowledgesnapshot)
- [`artifacts.LinkRelationship`](../domain/artifacts.ts.mdmd.md#symbol-linkrelationship)
- [`artifacts.LinkRelationshipKind`](../domain/artifacts.ts.mdmd.md#symbol-linkrelationshipkind)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [linkInference.test.ts](../inference/linkInference.test.ts.mdmd.md)
- [relationshipRuleProvider.test.ts](../rules/relationshipRuleProvider.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
