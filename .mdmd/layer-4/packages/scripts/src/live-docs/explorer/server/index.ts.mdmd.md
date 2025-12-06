# packages/scripts/src/live-docs/explorer/server/index.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/server/index.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-server-index-ts
- Generated At: 2025-12-05T15:37:23.169Z

## Authored
### Purpose
HTTP server entry point for the Live Documentation Explorer. Starts a local server that serves the visualization UI and exposes graph data via `/graph` and `/details` endpoints.[AI-Agent-Workspace/ChatHistory/2025/11/2025-11-21.md]

### Notes
- Created 2025-11-21 as part of the `packages/scripts` modularisation.
- Returns an `ExplorerServerInstance` with `stop()`, `reloadGraph()`, and `getGraph()` methods for programmatic control.
- Automatically opens the browser when `openBrowser: true` is passed.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-05T15:37:23.169Z","inputHash":"f0cb505499f8d222"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ExplorerServerOptions` {#symbol-explorerserveroptions}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/server/index.ts#L11)

#### `ExplorerServerInstance` {#symbol-explorerserverinstance}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/server/index.ts#L18)

#### `startExplorerServer` {#symbol-startexplorerserver}
- Type: function
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/server/index.ts#L30)
- Parameters: `options`: [`ExplorerServerOptions`](../../../index.ts.mdmd.md#symbol-explorerserveroptions)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `child_process` - `exec`
- `fs/promises` - `fs`
- `http` - `IncomingMessage`, `ServerResponse`, `createServer`
- [`buildAssets.buildExplorerAssets`](./buildAssets.ts.mdmd.md#symbol-buildexplorerassets)
- [`graph.buildExplorerGraph`](./graph.ts.mdmd.md#symbol-buildexplorergraph)
- [`graph.normalizeDocPath`](./graph.ts.mdmd.md#symbol-normalizedocpath)
- [`types.ExplorerDetailPayload`](../shared/types.ts.mdmd.md#symbol-explorerdetailpayload) (type-only)
- [`types.ExplorerGraphPayload`](../shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`types.ExplorerNodePayload`](../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
- `path` - `path`
- `url` - `URL`
<!-- LIVE-DOC:END Dependencies -->
