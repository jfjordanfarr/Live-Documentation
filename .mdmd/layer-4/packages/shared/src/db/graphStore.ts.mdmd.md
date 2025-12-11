# packages/shared/src/db/graphStore.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/db/graphStore.ts
- Live Doc ID: LD-implementation-packages-shared-src-db-graphstore-ts
- Generated At: 2025-12-11T02:38:01.578Z

## Authored
### Purpose
Backs the workspace knowledge graph with a deterministic better-sqlite3 store—bootstrapped during the implementation kickoff to capture artifacts, links, acknowledgements, and maintenance signals per [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-16.SUMMARIZED.md#turn-13-implementation-bootstrap-lines-2000-2523](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-16.SUMMARIZED.md#turn-13-implementation-bootstrap-lines-2000-2523)—so diagnostics, ingestion, and maintenance all share a single source of truth.

### Notes
Canonical ID reuse and drift-history projection landed as part of the October 23 persistence hardening, eliminating `artifacts`/`links` uniqueness faults and feeding downstream symbol-neighbor and diagnostics flows; see [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-23.SUMMARIZED.md#turn-27-graphstore-dedupe-attempt--new-failures-lines-3521-4000](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-23.SUMMARIZED.md#turn-27-graphstore-dedupe-attempt--new-failures-lines-3521-4000).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-11T02:38:01.578Z","inputHash":"0c68ac48e130ff59"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `DriftHistorySummary` {#symbol-drifthistorysummary}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/db/graphStore.ts#L43)

#### `ListDriftHistoryOptions` {#symbol-listdrifthistoryoptions}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/db/graphStore.ts#L44)

#### `GraphStoreOptions` {#symbol-graphstoreoptions}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/db/graphStore.ts#L47)

#### `LinkedArtifactSummary` {#symbol-linkedartifactsummary}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/db/graphStore.ts#L52)

#### `GraphStore` {#symbol-graphstore}
- Type: class
- Source: [source](../../../../../../packages/shared/src/db/graphStore.ts#L94)

##### `GraphStore` — Summary
Thin wrapper around better-sqlite3 that materialises our knowledge-graph projections. The
implementation deliberately keeps schema bootstrapping local so the store can be rebuilt after
cache deletion without bespoke tooling.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `./graphStore.mappers` - `mapArtifactRow`, `mapDiagnosticRow`, `mapDriftHistoryRow`, `mapLinkRow`, `mapLlmEdgeProvenanceRow`
- `./graphStore.types` - `ArtifactRow`, `DiagnosticRow`, `DriftHistoryAckRow`, `DriftHistoryCountRow`, `DriftHistoryRow`, `DriftHistorySummary`, `FindDiagnosticByChangeEventOptions`, `LinkRow`, `LinkedArtifactRow`, `ListDriftHistoryOptions`, `LlmEdgeProvenanceRow`, `UpdateDiagnosticStatusOptions`
- `better-sqlite3` - `Database`
- `node:fs` - `fs`
- `node:path` - `path`
- [`artifacts.AcknowledgementAction`](../domain/artifacts.ts.mdmd.md#symbol-acknowledgementaction)
- [`artifacts.ChangeEvent`](../domain/artifacts.ts.mdmd.md#symbol-changeevent)
- [`artifacts.DiagnosticRecord`](../domain/artifacts.ts.mdmd.md#symbol-diagnosticrecord)
- [`artifacts.DiagnosticStatus`](../domain/artifacts.ts.mdmd.md#symbol-diagnosticstatus)
- [`artifacts.DriftHistoryEntry`](../domain/artifacts.ts.mdmd.md#symbol-drifthistoryentry)
- [`artifacts.DriftHistoryStatus`](../domain/artifacts.ts.mdmd.md#symbol-drifthistorystatus)
- [`artifacts.KnowledgeArtifact`](../domain/artifacts.ts.mdmd.md#symbol-knowledgeartifact)
- [`artifacts.KnowledgeSnapshot`](../domain/artifacts.ts.mdmd.md#symbol-knowledgesnapshot)
- [`artifacts.LinkRelationship`](../domain/artifacts.ts.mdmd.md#symbol-linkrelationship)
- [`artifacts.LinkRelationshipKind`](../domain/artifacts.ts.mdmd.md#symbol-linkrelationshipkind)
- [`artifacts.LlmAssessment`](../domain/artifacts.ts.mdmd.md#symbol-llmassessment)
- [`artifacts.LlmEdgeProvenance`](../domain/artifacts.ts.mdmd.md#symbol-llmedgeprovenance)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [graphStore.test.ts](./graphStore.test.ts.mdmd.md)
- [linkInference.test.ts](../inference/linkInference.test.ts.mdmd.md)
- [relationshipRuleProvider.test.ts](../rules/relationshipRuleProvider.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
