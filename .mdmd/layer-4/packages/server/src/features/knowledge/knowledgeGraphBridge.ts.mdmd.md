# packages/server/src/features/knowledge/knowledgeGraphBridge.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/knowledge/knowledgeGraphBridge.ts
- Live Doc ID: LD-implementation-packages-server-src-features-knowledge-knowledgegraphbridge-ts
- Generated At: 2025-11-24T15:19:58.633Z

## Authored
### Purpose
Bootstraps knowledge feed ingestion for the workspace by discovering static feed descriptors, wiring checkpoints, and delegating updates to `KnowledgeGraphIngestor`, as introduced during the Oct 20 ingestion milestone captured in [2025-10-20 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-20.SUMMARIZED.md).

### Notes
- Hosts the feed manager, diagnostics gateway, and derived child loggers so per-feed health surfaces cleanly, incorporating the follow-up logging and discovery tweaks tracked in [2025-10-30 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-30.SUMMARIZED.md).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-11-24T15:19:58.633Z","inputHash":"371be4ea7634890b"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `KnowledgeGraphBridgeLogger` {#symbol-knowledgegraphbridgelogger}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/knowledge/knowledgeGraphBridge.ts#L36)

#### `KnowledgeGraphBridgeServiceOptions` {#symbol-knowledgegraphbridgeserviceoptions}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/knowledge/knowledgeGraphBridge.ts#L42)

#### `KnowledgeGraphBridgeStartResult` {#symbol-knowledgegraphbridgestartresult}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/knowledge/knowledgeGraphBridge.ts#L55)

#### `KnowledgeGraphBridgeDisposable` {#symbol-knowledgegraphbridgedisposable}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/knowledge/knowledgeGraphBridge.ts#L59)

#### `KnowledgeGraphBridgeService` {#symbol-knowledgegraphbridgeservice}
- Type: class
- Source: [source](../../../../../../../packages/server/src/features/knowledge/knowledgeGraphBridge.ts#L63)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared` - `ArtifactLayer`, `ExternalArtifact`, `ExternalLink`, `ExternalSnapshot`, `GraphStore`, `KnowledgeFeed`, `KnowledgeGraphBridge`, `LinkRelationshipKind`
- `node:crypto` - `createHash`
- `node:fs` - `fs`, `promises`
- `node:path` - `path`
- `node:url` - `pathToFileURL`
- [`feedCheckpointStore.FileFeedCheckpointStore`](./feedCheckpointStore.ts.mdmd.md#symbol-filefeedcheckpointstore)
- [`feedDiagnosticsGateway.FeedDiagnosticsGateway`](./feedDiagnosticsGateway.ts.mdmd.md#symbol-feeddiagnosticsgateway)
- [`feedDiagnosticsGateway.FeedDiagnosticsGatewayOptions`](./feedDiagnosticsGateway.ts.mdmd.md#symbol-feeddiagnosticsgatewayoptions)
- [`feedDiagnosticsGateway.FeedStatusSummary`](./feedDiagnosticsGateway.ts.mdmd.md#symbol-feedstatussummary)
- [`feedFormatDetector.parseFeedFile`](./feedFormatDetector.ts.mdmd.md#symbol-parsefeedfile)
- [`knowledgeFeedManager.BackoffOptions`](./knowledgeFeedManager.ts.mdmd.md#symbol-backoffoptions)
- [`knowledgeFeedManager.Disposable`](./knowledgeFeedManager.ts.mdmd.md#symbol-disposable)
- [`knowledgeFeedManager.FeedConfiguration`](./knowledgeFeedManager.ts.mdmd.md#symbol-feedconfiguration)
- [`knowledgeFeedManager.KnowledgeFeedManager`](./knowledgeFeedManager.ts.mdmd.md#symbol-knowledgefeedmanager)
- [`knowledgeGraphIngestor.KnowledgeGraphIngestor`](./knowledgeGraphIngestor.ts.mdmd.md#symbol-knowledgegraphingestor)
- [`knowledgeGraphIngestor.KnowledgeGraphIngestorLogger`](./knowledgeGraphIngestor.ts.mdmd.md#symbol-knowledgegraphingestorlogger)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [knowledgeGraphBridge.test.ts](./knowledgeGraphBridge.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
