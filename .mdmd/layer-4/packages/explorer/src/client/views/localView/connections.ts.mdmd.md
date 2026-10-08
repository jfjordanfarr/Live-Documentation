# packages/explorer/src/client/views/localView/connections.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/connections.ts
- Generated At: 2026-10-07T01:30:16.988Z

## Authored
### Purpose

SVG wire drawing for the Local Map: Bézier splines between the symbol pins of the cards, one drawer for the exploration columns, one for a drawn path and one for independent branches, sharing one anchor measurer and one overlay builder.

### Notes

- Created 2025-12-04 during the localView modularisation; `drawConnections` dispatches by what is active and maps symbol keys to registered anchors.
- Every wire runs from a provider's blue pin to a consumer's green pin. The path drawer, `drawPathConnections`, takes the wires from the path subgraph: the later file of an adjacent pair uses the earlier one, so the provider is the earlier column's blue pin and the consumer the later column's green pin. A reference that runs against the path is not drawn; the toolbar counts it. Until [Turn 10 of 2026-10-01](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-01.1.record.md#turn-10) the path wires took the dependent's blue pin as their start, so they reached backwards across the columns or flowed from the wrong pins.
- A file's own references are drawn as the two laces of the "French Corset", from `computeSelfLoopStubs` in `connection-geometry.ts`: at each pin a lace that leaves it, sweeps past its card's edge, turns toward the other row and comes back to be cut flush by that edge, as a wire passing behind the card would be (since 2026-10-07, after the owner's marked-up picture, [Turn 14](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-06.1.record.md#turn-14)); each pin's card edge comes from the anchor measurement's card rect through `cardEdgesOf`, and a back reference's two laces are each cut by their own card. The laces of one pin that turn the same way nest outward, counted across one drawing by `appendSelfLoopPath`'s `ranks`. The laces' shape comes from the Local Map's tuning (`laceShape`: the reach beyond the edge, the curl, the width and the taper), so the owner can tune it by eye from the tuning panel, which redraws the wires as a dial moves ([Turn 13](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-06.1.record.md#turn-13)). The same night a hidden middle between the two laces, drawn through the card on hover, was tried and set aside by the owner's eye, and the next a return inset dial went when the cut left it nothing to show. The gradient every wire carries is built once, by `appendGradient`. Until 2026-10-06 the module carried its own copy of the geometry and drew straight stubs ([Turn 15](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-05.1.record.md#turn-15)).
- The branch drawer, `drawBranchConnections`, draws every reference among the retained files: a reference between adjacent columns as the native curve; one that skips columns threaded by `threadedRoute` through the lanes the order reserved, read back from the renderer's spacers, each lane's top from the page and each slot's place from the spacer's `data-slots`, so it never reaches backward and never enters a card; and one that reads against the columns, a cycle's feedback, as Corset laces at its pins with a `back-route` path that CSS shows only while a symbol's hover highlights it. Until 2026-10-05 every skipped or cyclic reference took an orthogonal detour over the top of the whole picture in a lane of its own, which on this repository's five-file scope was 162 of 204 wires ([the October 5 session](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-05.1.record.md#turn-4)).
- The wires of one offering pin that pass a column together share one slot of its lane, so their paths coincide there; beneath them the branch drawer draws the bundle's shared run once more, the curve into the lane and the run along it, as wide as the member count on a logarithmic scale and stamped `data-members`, so the picture says how many a bundle carries before they part. The run carries no reference: it has no endpoint attributes, the deck does not read it as a wire, and it never highlights (2026-10-05, after the owner's review of the first pass).
- Uses the `BezierTuning` parameters from `ExplorerState` for curve aesthetics, through the pure `curveTo` of `branch-routing.ts`.
- The branch drawer measures every pin before it writes any wire (2026-10-07), so that a drawing lays the page out once rather than once per wire: a move of the picture redraws the wires every frame.
- A column's horizontal extent is read from the wrappers that say their column (`data-column`), a card's and a closed directory's box alike, rather than from the cards' pins (2026-10-08): a box has no pin, and a column of boxes alone is passed by lanes like any other. The classic drawing's center may be null.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ConnectionsContext` {#symbol-connectionscontext}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/connections.ts#L14)

##### `ConnectionsContext` — Summary
Ambient context required by {@link drawConnections} to measure DOM
anchors, read explorer state, and emit SVG paths.

#### `drawConnections` {#symbol-drawconnections}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/connections.ts#L86)
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
- [`types.LocalMapTuning`](../../types.ts.mdmd.md#symbol-localmaptuning) (type-only)
- [`connection-geometry.DEFAULT_SELF_LOOP_PARAMS`](../connection-geometry.ts.mdmd.md#symbol-default_self_loop_params)
- [`connection-geometry.LaceEdges`](../connection-geometry.ts.mdmd.md#symbol-laceedges)
- [`connection-geometry.SelfLoopParams`](../connection-geometry.ts.mdmd.md#symbol-selfloopparams)
- [`connection-geometry.computeSelfLoopStubs`](../connection-geometry.ts.mdmd.md#symbol-computeselfloopstubs)
- [`branch-routing.LANE_MARGIN`](./branch-routing.ts.mdmd.md#symbol-lane_margin)
- [`branch-routing.Passage`](./branch-routing.ts.mdmd.md#symbol-passage)
- [`branch-routing.RoutePiece`](./branch-routing.ts.mdmd.md#symbol-routepiece)
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
