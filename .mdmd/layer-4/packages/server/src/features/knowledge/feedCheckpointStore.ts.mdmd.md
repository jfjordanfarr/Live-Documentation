# packages/server/src/features/knowledge/feedCheckpointStore.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/knowledge/feedCheckpointStore.ts
- Live Doc ID: LD-implementation-packages-server-src-features-knowledge-feedcheckpointstore-ts
- Generated At: 2025-12-05T04:16:18.012Z

## Authored
### Purpose
Persists per-feed stream checkpoints on disk so ingestion can resume without replaying snapshots, matching the durability layer established in [2025-10-20 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-20.SUMMARIZED.md).

### Notes
- Sanitises filenames and validates payloads to defend against malformed checkpoint JSON before committing to disk.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-05T04:16:18.012Z","inputHash":"4fb3d9b06e9369ce"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `FeedCheckpointStore` {#symbol-feedcheckpointstore}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/knowledge/feedCheckpointStore.ts#L6)

#### `FileFeedCheckpointStore` {#symbol-filefeedcheckpointstore}
- Type: class
- Source: [source](../../../../../../../packages/server/src/features/knowledge/feedCheckpointStore.ts#L12)
- Implements: `FeedCheckpointStore`
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared` - `StreamCheckpoint`
- `node:fs` - `promises`
- `node:path` - `path`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [knowledgeFeedManager.test.ts](./knowledgeFeedManager.test.ts.mdmd.md)
- [knowledgeGraphBridge.test.ts](./knowledgeGraphBridge.test.ts.mdmd.md)
- [knowledgeGraphIngestor.test.ts](./knowledgeGraphIngestor.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
