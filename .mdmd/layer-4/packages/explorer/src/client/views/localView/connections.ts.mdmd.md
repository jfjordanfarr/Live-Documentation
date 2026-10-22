# packages/explorer/src/client/views/localView/connections.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/connections.ts
- Generated At: 2026-10-22T16:47:55.848Z

## Authored
### Purpose

SVG wire drawing for the Local Map: Bézier splines between the symbol pins of the cards, one directory-aware router for neighborhoods, retained branches and paths, with stable reference identities through motion.

### Notes

- Created 2025-12-04 during the localView modularisation; `drawConnections` maps the shared scene’s symbol keys to registered anchors.
- Every wire runs from a provider's blue pin to a consumer's green pin. A path’s disclosed subgraph includes only forward adjacent-hop references: the later file of an adjacent pair uses the earlier one, so the provider is the earlier column's blue pin and the consumer the later column's green pin. A reference that runs against the path is not drawn; the toolbar counts it. Until [Turn 10 of 2026-10-01](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-01.1.record.md#turn-10) the path wires took the dependent's blue pin as their start, so they reached backwards across the columns or flowed from the wrong pins.
- A file's own references are drawn as the two laces of the "French Corset", from `computeSelfLoopStubs` in `connection-geometry.ts`: at each pin a lace that leaves it, sweeps past its card's edge, turns toward the other row and comes back to be cut flush by that edge, as a wire passing behind the card would be (since 2026-10-07, after the owner's marked-up picture, [Turn 14](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-06.1.record.md#turn-14)); each pin's card edge comes from the anchor measurement's card rect through `cardEdgesOf`, and a back reference's two laces are each cut by their own card. The laces of one pin that turn the same way nest outward, counted across one drawing by `appendSelfLoopPath`'s `ranks`. The laces' shape comes from the Local Map's tuning (`laceShape`: the reach beyond the edge, the curl, the width and the taper), so the owner can tune it by eye from the tuning panel, which redraws the wires as a dial moves ([Turn 13](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-06.1.record.md#turn-13)). The same night a hidden middle between the two laces, drawn through the card on hover, was tried and set aside by the owner's eye, and the next a return inset dial went when the cut left it nothing to show. The gradient every wire carries is built once, by `appendGradient`. Until 2026-10-06 the module carried its own copy of the geometry and drew straight stubs ([Turn 15](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-05.1.record.md#turn-15)).
- The branch drawer, `drawBranchConnections`, draws every reference among the retained files: a reference between adjacent columns as the native curve; one that skips columns threaded by `threadedRoute` through the lanes the order reserved, read back from the renderer's spacers, each lane's top from the page and each slot's place from the spacer's `data-slots`, so it never reaches backward and never enters a card; and one that reads against the columns, a cycle's feedback, as Corset laces at its pins with a `back-route` path that CSS shows only while a symbol's hover highlights it. Until 2026-10-05 every skipped or cyclic reference took an orthogonal detour over the top of the whole picture in a lane of its own, which on this repository's five-file scope was 162 of 204 wires ([the October 5 session](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-05.1.record.md#turn-4)).
- The wires of one offering pin that pass a column together share one slot of its lane, so their paths coincide there; beneath them the branch drawer draws the bundle's shared run once more, the curve into the lane and the run along it, as wide as the member count on a logarithmic scale and stamped `data-members`, so the picture says how many a bundle carries before they part. The run carries no reference: it has no endpoint attributes, the deck does not read it as a wire, and it never highlights (2026-10-05, after the owner's review of the first pass).
- Uses the `BezierTuning` parameters from `ExplorerState` for curve aesthetics, through the pure `curveTo` of `branch-routing.ts`.
- The branch drawer measures every pin before it writes any wire (2026-10-07), so that a drawing lays the page out once rather than once per wire: a move of the picture redraws the wires every frame.
- Since 2026-10-16 the overlay holds one SVG kept across drawings, with every wire's, lace's and bundle run's element by its key on the runtime's `WireLayer` and each wire's gradient with it: a drawing writes each element's geometry in place (a path's `d`, a polygon's `points`, the gradient's ends, the presence), makes an element only when its key is new, placed after the others or beneath them all for a bundle's run, and removes it with its gradient when its wire is gone. The fresh SVG and the reconciliation by key of 2026-10-07 went: a frame of a move spent 41 ms at 418 wires building and reconciling them against under 1.5 ms of the browser's own layout, and 11.5 after ([the probe](../../../../../../../../AI-Agent-Workspace/Probes/2026-10-16/explorer-performance/README.md), [the decision](../../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#the-local-maps-work-stays-with-the-view-and-the-wires-keep-their-elements-recorded-2026-10-16)). The constraints of the owner's [connector-motion review](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-7--owner-review-of-alignment-and-motion) hold by construction: an element's hover class survives because the element does, the layer's opacity is never toggled, and a new wire inherits the entering presence of its endpoint cards. `clearConnections` empties the overlay and forgets the layer.
- A column's horizontal extent is read from the wrappers that say their column (`data-column`), a card's and a closed directory's box alike, rather than from the cards' pins (2026-10-08): a box has no pin, and a column of boxes alone is passed by lanes like any other.

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
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/connections.ts#L71)
- Parameters: `context`: [`ConnectionsContext`](#symbol-connectionscontext)

##### `drawConnections` — Summary
Draw every Local Map scope with the shared directory-aware router. The
wires' elements are kept by key across drawings and their geometry written
in place, so that a move, which draws every frame, measures the page and
writes each wire's shape and nothing else; an element whose wire the picture
no longer has leaves with its gradient (2026-10-16; the drawing of
2026-10-07 built the SVG anew each frame and reconciled it by key, which
cost more than the measuring and the routing together).

#### `clearConnections` {#symbol-clearconnections}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/connections.ts#L101)
- Parameters: `runtime`: [`LocalViewRuntime`](./runtime.ts.mdmd.md#symbol-localviewruntime)

##### `clearConnections` — Summary
Takes every wire off the overlay and forgets the layer; the next drawing makes a new one.
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
- [`runtime.WireLayer`](./runtime.ts.mdmd.md#symbol-wirelayer) (type-only)
- [`types.ColumnRole`](./types.ts.mdmd.md#symbol-columnrole) (type-only)
- [`types.LayoutExtents`](./types.ts.mdmd.md#symbol-layoutextents) (type-only)
- [`types.LocalEdge`](./types.ts.mdmd.md#symbol-localedge) (type-only)
- [`symbolAnchors.normalizeSymbolIdentifier`](../symbolAnchors.ts.mdmd.md#symbol-normalizesymbolidentifier)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../../../../../layer-3/architectural-decisions.mdmd.md)
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
