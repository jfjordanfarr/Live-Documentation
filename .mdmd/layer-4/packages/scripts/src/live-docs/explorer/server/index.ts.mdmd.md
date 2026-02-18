# packages/scripts/src/live-docs/explorer/server/index.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/server/index.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-server-index-ts
- Generated At: 2026-02-18T21:27:52.021Z

## Authored
### Purpose
HTTP server entry point for the Live Documentation Explorer. Starts a local server that serves the visualization UI and exposes graph data via `/graph` and `/details` endpoints.[AI-Agent-Workspace/ChatHistory/2025/11/2025-11-21.md]

### Notes
- Created 2025-11-21 as part of the `packages/scripts` modularisation.
- Returns an `ExplorerServerInstance` with `stop()`, `reloadGraph()`, and `getGraph()` methods for programmatic control.
- Automatically opens the browser when `openBrowser: true` is passed.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-18T21:27:52.021Z","inputHash":"7d0f36ecea61b2e5"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ExplorerServerOptions` {#symbol-explorerserveroptions}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/server/index.ts#L16)

##### `ExplorerServerOptions` — Summary
Options for launching the Explorer HTTP server.

#### `ExplorerServerInstance` {#symbol-explorerserverinstance}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/server/index.ts#L25)

##### `ExplorerServerInstance` — Summary
Handle to a running Explorer server instance.

#### `startExplorerServer` {#symbol-startexplorerserver}
- Type: function
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/server/index.ts#L44)
- Parameters: `options`: [`ExplorerServerOptions`](../../../index.ts.mdmd.md#symbol-explorerserveroptions)

##### `startExplorerServer` — Summary
Starts the Explorer HTTP server, serving the Circuit Board, Local Map,
Force Graph, and Knowledge Sources views.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `child_process` - `execFile`
- `fs/promises`
- `http` - `IncomingMessage`, `ServerResponse`, `createServer`
- [`buildAssets.buildExplorerAssets`](./buildAssets.ts.mdmd.md#symbol-buildexplorerassets)
- [`graph.buildExplorerGraph`](./graph.ts.mdmd.md#symbol-buildexplorergraph)
- [`graph.normalizeDocPath`](./graph.ts.mdmd.md#symbol-normalizedocpath)
- [`bundledMarkdownScanner.BundledMarkdownResult`](../shared/bundledMarkdownScanner.ts.mdmd.md#symbol-bundledmarkdownresult)
- [`bundledMarkdownScanner.scanAndBundleMarkdown`](../shared/bundledMarkdownScanner.ts.mdmd.md#symbol-scanandbundlemarkdown)
- [`localMapBuilder.buildLocalMapData`](../shared/localMapBuilder.ts.mdmd.md#symbol-buildlocalmapdata)
- [`localMapBuilder.buildTestCoverageMap`](../shared/localMapBuilder.ts.mdmd.md#symbol-buildtestcoveragemap)
- [`types.ExplorerDetailPayload`](../shared/types.ts.mdmd.md#symbol-explorerdetailpayload) (type-only)
- [`types.ExplorerGraphPayload`](../shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`types.ExplorerLinkPayload`](../shared/types.ts.mdmd.md#symbol-explorerlinkpayload) (type-only)
- [`types.ExplorerNodePayload`](../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
- [`LiveDocumentationConfig`](../../../../../shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig) (type-only)
- `path`
- `url` - `URL`
<!-- LIVE-DOC:END Dependencies -->
