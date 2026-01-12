# packages/server/src/features/knowledge/feedDiagnosticsGateway.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/knowledge/feedDiagnosticsGateway.ts
- Live Doc ID: LD-implementation-packages-server-src-features-knowledge-feeddiagnosticsgateway-ts
- Generated At: 2026-01-12T21:47:40.515Z

## Authored
### Purpose
Tracks per-feed health transitions and emits structured status notifications for knowledge ingestion, forming the diagnostics layer shipped in [2025-10-20 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-20.SUMMARIZED.md).

### Notes
- Logs severity-aware messages while caching the latest status so listeners (bridge service, tests) can observe health changes without re-running ingestion.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-12T21:47:40.515Z","inputHash":"8581decc23ec3e99"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `FeedHealthStatus` {#symbol-feedhealthstatus}
- Type: type
- Source: [source](../../../../../../../packages/server/src/features/knowledge/feedDiagnosticsGateway.ts#L3)

#### `FeedStatusSummary` {#symbol-feedstatussummary}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/knowledge/feedDiagnosticsGateway.ts#L5)

#### `FeedDiagnosticsGatewayOptions` {#symbol-feeddiagnosticsgatewayoptions}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/knowledge/feedDiagnosticsGateway.ts#L14)

#### `FeedDiagnosticsGateway` {#symbol-feeddiagnosticsgateway}
- Type: class
- Source: [source](../../../../../../../packages/server/src/features/knowledge/feedDiagnosticsGateway.ts#L23)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`index.KnowledgeFeedSummary`](../../../../shared/src/index.ts.mdmd.md#symbol-knowledgefeedsummary)
<!-- LIVE-DOC:END Dependencies -->
