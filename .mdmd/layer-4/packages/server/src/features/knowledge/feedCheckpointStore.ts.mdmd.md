# packages/server/src/features/knowledge/feedCheckpointStore.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/knowledge/feedCheckpointStore.ts
- Live Doc ID: LD-implementation-packages-server-src-features-knowledge-feedcheckpointstore-ts
- Generated At: 2026-01-12T21:47:40.513Z

## Authored
### Purpose
Persists per-feed stream checkpoints on disk so ingestion can resume without replaying snapshots, matching the durability layer established in [2025-10-20 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-20.SUMMARIZED.md).

### Notes
- Sanitises filenames and validates payloads to defend against malformed checkpoint JSON before committing to disk.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-12T21:47:40.513Z","inputHash":"f8ca1ec474e56f7b"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `FeedCheckpointStore` {#symbol-feedcheckpointstore}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/knowledge/feedCheckpointStore.ts#L6)

#### `FileFeedCheckpointStore` {#symbol-filefeedcheckpointstore}
- Type: class
- Source: [source](../../../../../../../packages/server/src/features/knowledge/feedCheckpointStore.ts#L12)
- Implements: [`FeedCheckpointStore`](#symbol-feedcheckpointstore)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `promises`
- `node:path` - `path`
- [`index.StreamCheckpoint`](../../../../shared/src/index.ts.mdmd.md#symbol-streamcheckpoint)
<!-- LIVE-DOC:END Dependencies -->
