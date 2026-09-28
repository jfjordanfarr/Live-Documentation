# packages/explorer/src/client/views/forceGraphView.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/forceGraphView.ts
- Generated At: 2026-09-28T01:11:43.450Z

## Authored
### Purpose
Renders the force-directed 3D graph view for the Live Docs Explorer, including the Related Documentation overlay: purple nodes for the markdown files that Live Docs link to, from the bundle's `relatedDocLinks`.

### Notes
- Created 2026-02-20 during the Explorer monolith refactor (1763 to 941 lines) that extracted this view alongside `download.ts`.
- Exposes `createForceGraphView()`, returning a `ForceGraphViewApi` with `render()`.
- Depends on the external `3d-force-graph` library.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ForceGraphLink` {#symbol-forcegraphlink}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphView.ts#L25)

##### `ForceGraphLink` — Summary
A link in the Force Graph between two nodes.

#### `ForceGraphNode` {#symbol-forcegraphnode}
- Type: type
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphView.ts#L32)
- Returns: [`ExplorerNodePayload`](../../shared/types.ts.mdmd.md#symbol-explorernodepayload)

##### `ForceGraphNode` — Summary
A node in the Force Graph, extending the payload with optional archetype.

#### `ForceGraphData` {#symbol-forcegraphdata}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphView.ts#L38)

##### `ForceGraphData` — Summary
Complete data structure for the Force Graph view.

#### `ForceGraphViewOptions` {#symbol-forcegraphviewoptions}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphView.ts#L62)

##### `ForceGraphViewOptions` — Summary
Options passed to the Force Graph view factory.

#### `ForceGraphViewApi` {#symbol-forcegraphviewapi}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphView.ts#L73)

##### `ForceGraphViewApi` — Summary
Public API surface of the Force Graph view.

#### `createForceGraphView` {#symbol-createforcegraphview}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphView.ts#L78)
- Returns: [`ForceGraphViewApi`](#symbol-forcegraphviewapi)
- Parameters: `options`: [`ForceGraphViewOptions`](#symbol-forcegraphviewoptions)

##### `createForceGraphView` — Summary
Creates the Force Graph (3D) view for the Live Docs Explorer.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`dom.requireElement`](../dom.ts.mdmd.md#symbol-requireelement)
- [`types.ExplorerState`](../types.ts.mdmd.md#symbol-explorerstate) (type-only)
- [`staticExplorerData.RelatedDocLink`](../../shared/staticExplorerData.ts.mdmd.md#symbol-relateddoclink) (type-only)
- [`types.ExplorerGraphPayload`](../../shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`types.ExplorerLinkPayload`](../../shared/types.ts.mdmd.md#symbol-explorerlinkpayload) (type-only)
- [`types.ExplorerNodePayload`](../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->
