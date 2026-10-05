# packages/explorer/src/client/views/localView/connections.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/connections.ts
- Generated At: 2026-10-05T16:55:01.458Z

## Authored
### Purpose

SVG wire drawing for the Local Map: Bézier splines between the symbol pins of the cards, one drawer for the exploration columns, one for a drawn path and one for independent branches, sharing one anchor measurer and one overlay builder.

### Notes

- Created 2025-12-04 during the localView modularisation; `drawConnections` dispatches by what is active and maps symbol keys to registered anchors.
- Every wire runs from a provider's blue pin to a consumer's green pin. The path drawer, `drawPathConnections`, takes the wires from the path subgraph: the later file of an adjacent pair uses the earlier one, so the provider is the earlier column's blue pin and the consumer the later column's green pin. A reference that runs against the path is not drawn; the toolbar counts it. Until [Turn 10 of 2026-10-01](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-01.1.record.md#turn-10) the path wires took the dependent's blue pin as their start, so they reached backwards across the columns or flowed from the wrong pins.
- Self-loops on each disclosed card are drawn as the two tapered stubs of the "French Corset".
- The branch drawer, `drawBranchConnections`, draws every reference among the retained files: a reference between adjacent columns as the native curve; one that skips columns threaded by `threadedRoute` through the lanes the order reserved, read back from the renderer's spacers, so it never reaches backward and never enters a card; and one that reads against the columns, a cycle's feedback, as Corset stubs at its pins with a `back-route` path that CSS shows only while a symbol's hover highlights it. Until 2026-10-05 every skipped or cyclic reference took an orthogonal detour over the top of the whole picture in a lane of its own, which on this repository's five-file scope was 162 of 204 wires ([the October 5 session](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-05.1.record.md#turn-4)).
- Uses the `BezierTuning` parameters from `ExplorerState` for curve aesthetics, through the pure `curveTo` of `branch-routing.ts`.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ConnectionsContext` {#symbol-connectionscontext}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/connections.ts#L13)

##### `ConnectionsContext` — Summary
Ambient context required by {@link drawConnections} to measure DOM
anchors, read explorer state, and emit SVG paths.

#### `drawConnections` {#symbol-drawconnections}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/connections.ts#L74)
- Parameters: `context`: [`ConnectionsContext`](#symbol-connectionscontext)

##### `drawConnections` — Summary
Main entry point for drawing SVG connection edges in the Local Map view.

Draws an explicit path, independent branches, or the classic neighborhood.
Each measures DOM anchor positions relative to the
container, computes Bézier curves, and appends `<path>` elements to the SVG
overlay.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.BezierTuning`](../../types.ts.mdmd.md#symbol-beziertuning) (type-only)
- [`types.ExplorerState`](../../types.ts.mdmd.md#symbol-explorerstate) (type-only)
- [`branch-routing.LANE_MARGIN`](./branch-routing.ts.mdmd.md#symbol-lane_margin)
- [`branch-routing.LANE_PADDING`](./branch-routing.ts.mdmd.md#symbol-lane_padding)
- [`branch-routing.LANE_PITCH`](./branch-routing.ts.mdmd.md#symbol-lane_pitch)
- [`branch-routing.Passage`](./branch-routing.ts.mdmd.md#symbol-passage)
- [`branch-routing.curveTo`](./branch-routing.ts.mdmd.md#symbol-curveto)
- [`branch-routing.threadedRoute`](./branch-routing.ts.mdmd.md#symbol-threadedroute)
- [`branches.BranchGraph`](./branches.ts.mdmd.md#symbol-branchgraph)
- [`branches.edgeKey`](./branches.ts.mdmd.md#symbol-edgekey)
- [`runtime.LocalViewRuntime`](./runtime.ts.mdmd.md#symbol-localviewruntime) (type-only)
- [`state.PathResult`](./state.ts.mdmd.md#symbol-pathresult) (type-only)
- [`types.ColumnRole`](./types.ts.mdmd.md#symbol-columnrole) (type-only)
- [`types.LayoutExtents`](./types.ts.mdmd.md#symbol-layoutextents) (type-only)
- [`types.LocalEdge`](./types.ts.mdmd.md#symbol-localedge) (type-only)
- [`symbolAnchors.normalizeSymbolIdentifier`](../symbolAnchors.ts.mdmd.md#symbol-normalizesymbolidentifier)
<!-- LIVE-DOC:END Dependencies -->
