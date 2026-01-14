# packages/scripts/src/index.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/index.ts
- Live Doc ID: LD-implementation-packages-scripts-src-index-ts
- Generated At: 2026-01-14T15:17:48.344Z

## Authored
### Purpose
Barrel export for the `@live-documentation/scripts` workspace package, exposing the Explorer server and graph-building utilities as the package's public API.[AI-Agent-Workspace/ChatHistory/2025/11/2025-11-21.md]

### Notes
- Created 2025-11-21 when the monolithic `visualize-explorer.ts` was refactored into a modular `packages/scripts` package.
- Consumers import `startExplorerServer` and related types from `@live-documentation/scripts` directly.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-14T15:17:48.344Z","inputHash":"4794c286c67dd107"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `startExplorerServer` {#symbol-startexplorerserver}
- Type: unknown
- Source: [source](../../../../../packages/scripts/src/index.ts#L2)

#### `ExplorerServerInstance` {#symbol-explorerserverinstance}
- Type: type (type-only)
- Source: [source](../../../../../packages/scripts/src/index.ts#L3)

#### `ExplorerServerOptions` {#symbol-explorerserveroptions}
- Type: type (type-only)
- Source: [source](../../../../../packages/scripts/src/index.ts#L4)

#### `ExplorerGraphPayload` {#symbol-explorergraphpayload}
- Type: unknown
- Source: [source](../../../../../packages/scripts/src/index.ts#L8)

#### `ExplorerDetailPayload` {#symbol-explorerdetailpayload}
- Type: unknown
- Source: [source](../../../../../packages/scripts/src/index.ts#L9)

#### `ExplorerNodePayload` {#symbol-explorernodepayload}
- Type: unknown
- Source: [source](../../../../../packages/scripts/src/index.ts#L10)

#### `ExplorerLinkPayload` {#symbol-explorerlinkpayload}
- Type: unknown
- Source: [source](../../../../../packages/scripts/src/index.ts#L11)

#### `ExplorerLinkKind` {#symbol-explorerlinkkind}
- Type: unknown
- Source: [source](../../../../../packages/scripts/src/index.ts#L12)

#### `buildLiveDocGraph` {#symbol-buildlivedocgraph}
- Type: unknown
- Source: [source](../../../../../packages/scripts/src/index.ts#L16)

#### `BuildLiveDocGraphOptions` {#symbol-buildlivedocgraphoptions}
- Type: type (type-only)
- Source: [source](../../../../../packages/scripts/src/index.ts#L17)

#### `LiveDocGraph` {#symbol-livedocgraph}
- Type: type (type-only)
- Source: [source](../../../../../packages/scripts/src/index.ts#L18)

#### `LiveDocGraphNode` {#symbol-livedocgraphnode}
- Type: type (type-only)
- Source: [source](../../../../../packages/scripts/src/index.ts#L19)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`index.ExplorerServerInstance`](./live-docs/explorer/server/index.ts.mdmd.md#symbol-explorerserverinstance) (re-export)
- [`index.ExplorerServerOptions`](./live-docs/explorer/server/index.ts.mdmd.md#symbol-explorerserveroptions) (re-export)
- [`index.startExplorerServer`](./live-docs/explorer/server/index.ts.mdmd.md#symbol-startexplorerserver) (re-export)
- [`types.ExplorerDetailPayload`](./live-docs/explorer/shared/types.ts.mdmd.md#symbol-explorerdetailpayload) (re-export, type-only)
- [`types.ExplorerGraphPayload`](./live-docs/explorer/shared/types.ts.mdmd.md#symbol-explorergraphpayload) (re-export, type-only)
- [`types.ExplorerLinkKind`](./live-docs/explorer/shared/types.ts.mdmd.md#symbol-explorerlinkkind) (re-export, type-only)
- [`types.ExplorerLinkPayload`](./live-docs/explorer/shared/types.ts.mdmd.md#symbol-explorerlinkpayload) (re-export, type-only)
- [`types.ExplorerNodePayload`](./live-docs/explorer/shared/types.ts.mdmd.md#symbol-explorernodepayload) (re-export, type-only)
- [`liveDocGraph.BuildLiveDocGraphOptions`](./live-docs/graph/liveDocGraph.ts.mdmd.md#symbol-buildlivedocgraphoptions) (re-export)
- [`LiveDocGraph`](./live-docs/graph/liveDocGraph.ts.mdmd.md#symbol-livedocgraph) (re-export)
- [`liveDocGraph.LiveDocGraphNode`](./live-docs/graph/liveDocGraph.ts.mdmd.md#symbol-livedocgraphnode) (re-export)
- [`liveDocGraph.buildLiveDocGraph`](./live-docs/graph/liveDocGraph.ts.mdmd.md#symbol-buildlivedocgraph) (re-export)
<!-- LIVE-DOC:END Dependencies -->
