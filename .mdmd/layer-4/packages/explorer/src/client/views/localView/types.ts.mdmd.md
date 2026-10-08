# packages/explorer/src/client/views/localView/types.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/types.ts
- Generated At: 2026-10-08T01:58:14.518Z

## Authored
### Purpose
Type definitions for the Local Map view. Centralises interfaces for view options, subgraph structures, anchor registries, and column roles.[AI-Agent-Workspace/ChatHistory/2025/12/2025-12-04.md]

### Notes
- Created 2025-12-04 when `localView.ts` was split into a modular directory.
- `LocalSubgraph` describes the 3-column layout (inbound, center, outbound nodes).
- `CenterAlignmentGuides` tracks vertical positions for connection line rendering.
- `LocalSubgraph.center` may be null since 2026-10-08: a branch picture entered by directory has no file in focus.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LocalViewOptions` {#symbol-localviewoptions}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/types.ts#L22)

##### `LocalViewOptions` — Summary
Dependency-injection options for constructing a Local Map view.

Carries the global explorer state, the full graph, callbacks for node
selection/recentering/sidebar-focus, a test-coverage lookup, and a
pre-built node-by-ID map for type-reference navigation.

##### `LocalViewOptions` — Remarks
Created 2025-12-04 when the monolithic `localView.ts` was extracted into
the `localView/` module. `nodesById` was added on 2025-12-05 to support
click-to-navigate type references in the Local Map symbol cards.

#### `BranchStrain` {#symbol-branchstrain}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/types.ts#L45)

##### `BranchStrain` — Summary
How hard the retained exploration's layout is working: the references that
skip columns and are threaded through lanes, and the references that read
against the columns and are drawn as stubs. The Explorer compares their sum
with the tuning's nudge threshold to suggest the Force Graph.

#### `LocalViewApi` {#symbol-localviewapi}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/types.ts#L57)

##### `LocalViewApi` — Summary
Public contract the Local Map exposes to the parent Explorer application.

Exposes rendering, camera alignment and explicit FROM/TO pathfinding.
Independent exploration pins belong to the shared Explorer state.

#### `LocalEdge` {#symbol-localedge}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/types.ts#L98)

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
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/types.ts#L110)
- Returns: [`LocalEdge`](#symbol-localedge)

##### `LocalSubgraphLink` — Summary
Alias for LocalEdge - used in subgraph contexts.

#### `LocalSubgraph` {#symbol-localsubgraph}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/types.ts#L119)

##### `LocalSubgraph` — Summary
The 1-hop neighborhood of the center node, partitioned into inbound
(upstream) and outbound (downstream) ID sets.

Built by `createLocalSubgraph()` and consumed by the render pipeline
to lay out the three-column Local Map view.

#### `CenterAlignmentGuides` {#symbol-centeralignmentguides}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/types.ts#L140)

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
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/types.ts#L149)

##### `Bounds` — Summary
Axis-aligned bounding rectangle in pixel coordinates, used for DOM
measurement of cards, columns, and the overall layout container.

#### `LayoutExtents` {#symbol-layoutextents}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/types.ts#L167)

##### `LayoutExtents` — Summary
The measured bounding boxes of the Local Map layout, used by
`fitMapToContent()` to compute an initial pan/zoom that frames all
visible content.

`focus` is nullable because the center card may not yet be in the DOM
at measurement time (e.g. during initial render before the selected
node's card mounts).

#### `MapTransform` {#symbol-maptransform}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/types.ts#L180)

##### `MapTransform` — Summary
Pan/zoom state for the Local Map viewport.

`x` and `y` are the CSS translate offsets (in pixels), and `k` is the
scale factor. Consumed by `updateMapTransform()`, `animateMapTransform()`,
and `zoomAtPoint()` to apply affine transforms to the map container
and its SVG connection overlay.

#### `ColumnRole` {#symbol-columnrole}
- Type: type
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/types.ts#L195)

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
- [`types.ExplorerGraphPayload`](../../../shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`types.ExplorerLinkKind`](../../../shared/types.ts.mdmd.md#symbol-explorerlinkkind) (type-only)
- [`types.ExplorerLinkPayload`](../../../shared/types.ts.mdmd.md#symbol-explorerlinkpayload) (type-only)
- [`types.ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->
