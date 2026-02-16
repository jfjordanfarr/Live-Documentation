# packages/scripts/src/live-docs/explorer/client/views/localView/types.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/views/localView/types.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-views-localview-types-ts
- Generated At: 2026-02-16T03:54:27.189Z

## Authored
### Purpose
Type definitions for the Local Map view. Centralises interfaces for view options, subgraph structures, anchor registries, and column roles.[AI-Agent-Workspace/ChatHistory/2025/12/2025-12-04.md]

### Notes
- Created 2025-12-04 when `localView.ts` was split into a modular directory.
- `LocalSubgraph` describes the 3-column layout (inbound, center, outbound nodes).
- `CenterAlignmentGuides` tracks vertical positions for connection line rendering.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-16T03:54:27.189Z","inputHash":"de4985b21b31092a"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LocalViewOptions` {#symbol-localviewoptions}
- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/types.ts#L22)

##### `LocalViewOptions` — Summary
Dependency-injection options for constructing a Local Map view.

Carries the global explorer state, the full graph, callbacks for node
selection/recentering/sidebar-focus, a test-coverage lookup, and a
pre-built node-by-ID map for type-reference navigation.

##### `LocalViewOptions` — Remarks
Created 2025-12-04 when the monolithic `localView.ts` was extracted into
the `localView/` module. `nodesById` was added on 2025-12-05 to support
click-to-navigate type references in the Local Map symbol cards.

#### `LocalViewApi` {#symbol-localviewapi}
- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/types.ts#L42)

##### `LocalViewApi` — Summary
Public contract the Local Map exposes to the parent Explorer application.

Originally provided core rendering and zoom controls. Extended on
2025-12-19 with multi-hop path mode methods (`addPinToPath`,
`removePinFromPath`, `setActivePath`, `getActivePath`), an observable
`localMapState` store, and a `dispose()` cleanup method.

#### `LocalEdge` {#symbol-localedge}
- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/types.ts#L87)

##### `LocalEdge` — Summary
A directed edge in the local subgraph, annotated with direction relative
to the center (focus) node.

`direction` is `"outbound"` when the center node depends on the target,
and `"inbound"` when the source depends on the center node. This drives
column placement and connection-line coloring (inbound = teal, outbound
= amber).

##### `LocalEdge` — Remarks
Created 2025-12-04 during Local Map modularization.

#### `LocalSubgraphLink` {#symbol-localsubgraphlink}
- Type: type
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/types.ts#L99)
- Returns: [`LocalEdge`](#symbol-localedge)

##### `LocalSubgraphLink` — Summary
Alias for LocalEdge - used in subgraph contexts.

#### `LocalSubgraph` {#symbol-localsubgraph}
- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/types.ts#L108)

##### `LocalSubgraph` — Summary
The 1-hop neighborhood of the center node, partitioned into inbound
(upstream) and outbound (downstream) ID sets.

Built by `createLocalSubgraph()` and consumed by the render pipeline
to lay out the three-column Local Map view.

#### `CenterAlignmentGuides` {#symbol-centeralignmentguides}
- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/types.ts#L128)

##### `CenterAlignmentGuides` — Summary
Captures per-symbol anchor positions and card vertical centers in the
center column, enabling SVG Bezier connection lines to align precisely
with symbol dots.

`anchors` maps `symbolSlug` to a Y-coordinate, while `cardCenters`
maps `nodeId` to the vertical midpoint of its card element.

##### `CenterAlignmentGuides` — Remarks
Created 2025-12-04 during the SVG Bezier connector work. Used by
`collectCenterAlignmentGuides()` and `lookupCenterAnchorPosition()`.

#### `Bounds` {#symbol-bounds}
- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/types.ts#L137)

##### `Bounds` — Summary
Axis-aligned bounding rectangle in pixel coordinates, used for DOM
measurement of cards, columns, and the overall layout container.

#### `LayoutExtents` {#symbol-layoutextents}
- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/types.ts#L155)

##### `LayoutExtents` — Summary
The measured bounding boxes of the Local Map layout, used by
`fitMapToContent()` to compute an initial pan/zoom that frames all
visible content.

`focus` is nullable because the center card may not yet be in the DOM
at measurement time (e.g. during initial render before the selected
node's card mounts).

#### `MapTransform` {#symbol-maptransform}
- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/types.ts#L168)

##### `MapTransform` — Summary
Pan/zoom state for the Local Map viewport.

`x` and `y` are the CSS translate offsets (in pixels), and `k` is the
scale factor. Consumed by `updateMapTransform()`, `animateMapTransform()`,
and `zoomAtPoint()` to apply affine transforms to the map container
and its SVG connection overlay.

#### `ColumnRole` {#symbol-columnrole}
- Type: type
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/types.ts#L183)

##### `ColumnRole` — Summary
Column role for anchor registration disambiguation.
Uses semantic names (upstream/downstream) instead of spatial (left/right)
to future-proof for multi-hop graph expansion.

- `upstream`: Dependencies column (data flows FROM these nodes)
- `center`: Focus/selected node column
- `downstream`: Dependents column (data flows TO these nodes)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.ExplorerState`](../../types.ts.mdmd.md#symbol-explorerstate) (type-only)
- [`types.TestCoverageMap`](../../types.ts.mdmd.md#symbol-testcoveragemap) (type-only)
- [`state.LocalMapState`](./state.ts.mdmd.md#symbol-localmapstate) (type-only)
- [`state.PathResult`](./state.ts.mdmd.md#symbol-pathresult) (type-only)
- [`state.StateStore`](./state.ts.mdmd.md#symbol-statestore) (type-only)
- [`state.SymbolPin`](./state.ts.mdmd.md#symbol-symbolpin) (type-only)
- [`types.ExplorerGraphPayload`](../../../shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`types.ExplorerLinkKind`](../../../shared/types.ts.mdmd.md#symbol-explorerlinkkind) (type-only)
- [`types.ExplorerLinkPayload`](../../../shared/types.ts.mdmd.md#symbol-explorerlinkpayload) (type-only)
- [`types.ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [layout-measure.test.ts](./layout-measure.test.ts.mdmd.md)
- [pan-zoom.test.ts](./pan-zoom.test.ts.mdmd.md)
- [subgraph-builder.test.ts](./subgraph-builder.test.ts.mdmd.md)
- [symbol-highlight.test.ts](./symbol-highlight.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
