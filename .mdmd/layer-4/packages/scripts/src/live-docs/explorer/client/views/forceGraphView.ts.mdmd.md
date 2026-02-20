# packages/scripts/src/live-docs/explorer/client/views/forceGraphView.ts

## Metadata

- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/views/forceGraphView.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-views-forcegraphview-ts
- Generated At: 2026-02-20T21:28:58.213Z

## Authored

### Purpose

Renders the Force-directed 3D graph view for the Live Docs Explorer, including the "Related Documentation" overlay that displays purple nodes for test/asset companions of the focused node. [AI-Agent-Workspace/ChatHistory/2026/02/2026-02-20.1.md]

### Notes

- Created 2026-02-20 during the Explorer monolith refactor (1763 → 941 lines) that extracted this view alongside `dataLoader.ts` and `download.ts`.
- Exposes `createForceGraphView()` factory returning a `ForceGraphViewApi` with `render()`, `focusNode()`, and `dispose()` methods.
- Depends on the external `3d-force-graph` library; the graph container is resolved via `requireElement('forceGraphContainer')`.

## Generated

<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-20T21:28:58.213Z","inputHash":"7078d3fcae67d898"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->

### Public Symbols

#### `ForceGraphLink` {#symbol-forcegraphlink}

- Type: interface
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/forceGraphView.ts#L26)

##### `ForceGraphLink` — Summary

A link in the Force Graph between two nodes.

#### `ForceGraphNode` {#symbol-forcegraphnode}

- Type: type
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/forceGraphView.ts#L33)
- Returns: [`ExplorerNodePayload`](../../shared/types.ts.mdmd.md#symbol-explorernodepayload)

##### `ForceGraphNode` — Summary

A node in the Force Graph, extending the payload with optional archetype.

#### `ForceGraphData` {#symbol-forcegraphdata}

- Type: interface
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/forceGraphView.ts#L39)

##### `ForceGraphData` — Summary

Complete data structure for the Force Graph view.

#### `ForceGraphViewOptions` {#symbol-forcegraphviewoptions}

- Type: interface
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/forceGraphView.ts#L63)

##### `ForceGraphViewOptions` — Summary

Options passed to the Force Graph view factory.

#### `ForceGraphViewApi` {#symbol-forcegraphviewapi}

- Type: interface
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/forceGraphView.ts#L76)

##### `ForceGraphViewApi` — Summary

Public API surface of the Force Graph view.

#### `createForceGraphView` {#symbol-createforcegraphview}

- Type: function
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/forceGraphView.ts#L81)
- Returns: [`ForceGraphViewApi`](#symbol-forcegraphviewapi)
- Parameters: `options`: [`ForceGraphViewOptions`](#symbol-forcegraphviewoptions)

##### `createForceGraphView` — Summary

Creates the Force Graph (3D) view for the Live Docs Explorer.

<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->

### Dependencies

- [`dataLoader.ServerBundledDocsState`](../dataLoader.ts.mdmd.md#symbol-serverbundleddocsstate) (type-only)
- [`dom.requireElement`](../dom.ts.mdmd.md#symbol-requireelement)
- [`types.ExplorerState`](../types.ts.mdmd.md#symbol-explorerstate) (type-only)
- [`staticExplorerData.RelatedDocLink`](../../shared/staticExplorerData.ts.mdmd.md#symbol-relateddoclink) (type-only)
- [`types.ExplorerGraphPayload`](../../shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`types.ExplorerLinkPayload`](../../shared/types.ts.mdmd.md#symbol-explorerlinkpayload) (type-only)
- [`types.ExplorerNodePayload`](../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->
