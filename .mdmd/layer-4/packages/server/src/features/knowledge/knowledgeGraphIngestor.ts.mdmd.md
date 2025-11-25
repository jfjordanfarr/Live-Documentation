# packages/server/src/features/knowledge/knowledgeGraphIngestor.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/knowledge/knowledgeGraphIngestor.ts
- Live Doc ID: LD-implementation-packages-server-src-features-knowledge-knowledgegraphingestor-ts
- Generated At: 2025-11-24T15:19:58.648Z

## Authored
### Purpose
Applies validated knowledge feed snapshots and stream events into the workspace graph, enforcing per-feed sequencing so the bridge and GraphStore stay consistent with upstream sources documented during the Oct 20 ingestion build recorded in [2025-10-20 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-20.SUMMARIZED.md).

### Notes
- Serialises feed processing via lightweight locks, prunes artifacts that disappear from provider snapshots, and normalises URIs/IDs before delegating to `KnowledgeGraphBridge`, reflecting the hardening pass called out in [2025-10-30 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-30.SUMMARIZED.md).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-11-24T15:19:58.648Z","inputHash":"f336ebe583ddf1fa"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `KnowledgeGraphIngestorLogger` {#symbol-knowledgegraphingestorlogger}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/knowledge/knowledgeGraphIngestor.ts#L22)

#### `KnowledgeGraphIngestorOptions` {#symbol-knowledgegraphingestoroptions}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/knowledge/knowledgeGraphIngestor.ts#L28)

#### `SnapshotIngestResult` {#symbol-snapshotingestresult}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/knowledge/knowledgeGraphIngestor.ts#L37)

#### `StreamIngestResult` {#symbol-streamingestresult}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/knowledge/knowledgeGraphIngestor.ts#L43)

#### `KnowledgeGraphIngestor` {#symbol-knowledgegraphingestor}
- Type: class
- Source: [source](../../../../../../../packages/server/src/features/knowledge/knowledgeGraphIngestor.ts#L49)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared` - `ExternalArtifact`, `ExternalLink`, `ExternalSnapshot`, `ExternalStreamEvent`, `GraphStore`, `KnowledgeGraphBridge`, `KnowledgeSnapshot`, `StreamCheckpoint`
- `node:crypto` - `createHash`
- [`feedCheckpointStore.FeedCheckpointStore`](./feedCheckpointStore.ts.mdmd.md#symbol-feedcheckpointstore)
- [`feedDiagnosticsGateway.FeedDiagnosticsGateway`](./feedDiagnosticsGateway.ts.mdmd.md#symbol-feeddiagnosticsgateway)
- [`feedDiagnosticsGateway.FeedHealthStatus`](./feedDiagnosticsGateway.ts.mdmd.md#symbol-feedhealthstatus)
- [`schemaValidator.assertValidSnapshot`](./schemaValidator.ts.mdmd.md#symbol-assertvalidsnapshot)
- [`schemaValidator.assertValidStreamEvent`](./schemaValidator.ts.mdmd.md#symbol-assertvalidstreamevent)
- [`uri.normalizeFileUri`](../utils/uri.ts.mdmd.md#symbol-normalizefileuri)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [knowledgeFeedManager.test.ts](./knowledgeFeedManager.test.ts.mdmd.md)
- [knowledgeGraphBridge.test.ts](./knowledgeGraphBridge.test.ts.mdmd.md)
- [knowledgeGraphIngestor.test.ts](./knowledgeGraphIngestor.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
