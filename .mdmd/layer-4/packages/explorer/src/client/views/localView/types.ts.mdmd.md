# packages/explorer/src/client/views/localView/types.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/types.ts
- Generated At: 2026-11-12T17:14:38.323Z

## Authored
### Purpose
Defines the 2D Local Map's application boundary and the subgraph, geometry and column-role values its renderer shares.

### Notes
- The [November 5 reading repair](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-04.1.record.md#turn-9) lets the pin capture carry an optional newly retained symbol, with the existing whole-file marker. This identifies a reading request without making the view infer retention policy or treating release as a request to unfold text.
- Created in the [December 4 Local Map modularisation](../../../../../../../../AI-Agent-Workspace/ChatHistory/2025/12/Summarized/2025-12-04.SUMMARIZED.md#turn-14-local-map-modularization-the-refactor), beside the controller and public factory.
- `LocalSubgraph` carries the files and annotated references of the current disclosure.
- `LocalSubgraph.center` may be null since 2026-10-08: a branch picture entered by directory has no file in focus.
- `LocalViewOptions` injects graph and presentation state plus distinct application actions for Inspect, Pin, Close, Centre, directory disclosure and contextual commands. A symbol is carried with its inspection target, and menu callbacks receive a viewport anchor. Separating these actions implements the grammar accepted in [October 19, Turn 24](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-19.1.record.md#turn-24) and continued in [October 20, Turn 2](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md#turn-2); the view supplies their 2D presentation while the application owns shared retention, subject and evidence state.
- `LocalExplorationFrame` captures the view's work around one application action: whether it leaves a path, then an `afterRender` restoration of the acted-on row or directory's screen anchor and native control focus. `LocalViewApi` also exposes direct path clearing without restoring the former camera, explicit path presentation, camera focus and subject anchors for perspective changes. Pin and directory reducers remain outside this API.
- `LocalViewApi.isShown` and `show` (2026-10-16): whether the map is the view shown, and the map shown again, which runs an owed render or resumes the search.

`ReadingControl` (November 5) names the control a person used to open or fold a description, the name or the book, so that `onReadingChange` and `captureReadingChange` can return keyboard focus to it after the render.

The [November 8 reading feedback](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-08.1.record.md#turn-3-additional-reading-feedback-during-the-review), addressed November 9 UTC, adds `LocalViewApi.tryRefreshReading`: true means the unchanged fixed-slot scene has refreshed its text and controls in place; false requests the normal render and focus/anchor restoration. Reading state and persistence remain application-owned.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LocalViewOptions` {#symbol-localviewoptions}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/types.ts#L24)

##### `LocalViewOptions` — Summary
Dependency-injection options for constructing a Local Map view.

Carries the global explorer state, the full graph, callbacks for node
selection/recentering/sidebar-focus, a test-coverage lookup, and a
pre-built node-by-ID map for type-reference navigation.

##### `LocalViewOptions` — Remarks
Created 2025-12-04 when the monolithic `localView.ts` was extracted into
the `localView/` module. `nodesById` was added on 2025-12-05 to support
click-to-navigate type references in the Local Map symbol cards.

#### `ReadingControl` {#symbol-readingcontrol}
- Type: type
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/types.ts#L59)

##### `ReadingControl` — Summary
The control a person used to open or fold a description: the name it belongs to, or the book beside it.

#### `LocalExplorationFrame` {#symbol-localexplorationframe}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/types.ts#L62)

##### `LocalExplorationFrame` — Summary
The view's before/after presentation work around one application-owned exploration action.

#### `LocalViewApi` {#symbol-localviewapi}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/types.ts#L73)

##### `LocalViewApi` — Summary
Public contract the Local Map exposes to the parent Explorer application.

Exposes rendering, camera alignment and explicit FROM/TO pathfinding.
Independent exploration pins belong to the shared Explorer state.

#### `LocalEdge` {#symbol-localedge}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/types.ts#L129)

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
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/types.ts#L143)
- Returns: [`LocalEdge`](#symbol-localedge)

##### `LocalSubgraphLink` — Summary
Alias for LocalEdge - used in subgraph contexts.

#### `LocalSubgraph` {#symbol-localsubgraph}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/types.ts#L150)

##### `LocalSubgraph` — Summary
The graph disclosed by the current Local Map scope: its files and
annotated references. Path construction also classifies adjacent hops
by direction; the common scene determines their layout.

#### `Bounds` {#symbol-bounds}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/types.ts#L163)

##### `Bounds` — Summary
Axis-aligned bounding rectangle in pixel coordinates, used for DOM
measurement of cards, columns, and the overall layout container.

#### `LayoutExtents` {#symbol-layoutextents}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/types.ts#L181)

##### `LayoutExtents` — Summary
The measured bounding boxes of the Local Map layout, used by
`fitMapToContent()` to compute an initial pan/zoom that frames all
visible content.

`focus` is nullable because the center card may not yet be in the DOM
at measurement time (e.g. during initial render before the selected
node's card mounts).

#### `MapTransform` {#symbol-maptransform}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/types.ts#L194)

##### `MapTransform` — Summary
Pan/zoom state for the Local Map viewport.

`x` and `y` are the CSS translate offsets (in pixels), and `k` is the
scale factor. Consumed by `updateMapTransform()`, `animateMapTransform()`,
and `zoomAtPoint()` to apply affine transforms to the map container
and its SVG connection overlay.

#### `ColumnRole` {#symbol-columnrole}
- Type: type
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/types.ts#L209)

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
- [`reader-links.ReaderLinkContext`](../../reader-links.ts.mdmd.md#symbol-readerlinkcontext) (type-only)
- [`types.ExplorerState`](../../types.ts.mdmd.md#symbol-explorerstate) (type-only)
- [`types.InspectionTarget`](../../types.ts.mdmd.md#symbol-inspectiontarget) (type-only)
- [`types.TestCoverageMap`](../../types.ts.mdmd.md#symbol-testcoveragemap) (type-only)
- [`state.LocalMapState`](./state.ts.mdmd.md#symbol-localmapstate) (type-only)
- [`state.PathResult`](./state.ts.mdmd.md#symbol-pathresult) (type-only)
- [`state.StateStore`](./state.ts.mdmd.md#symbol-statestore) (type-only)
- [`types.ExplorerGraphPayload`](../../../shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`types.ExplorerLinkKind`](../../../shared/types.ts.mdmd.md#symbol-explorerlinkkind) (type-only)
- [`types.ExplorerLinkPayload`](../../../shared/types.ts.mdmd.md#symbol-explorerlinkpayload) (type-only)
- [`types.ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
