# scripts/layout-lab/routes.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/layout-lab/routes.ts
- Generated At: 2026-10-06T20:39:25.964Z

## Authored
### Purpose

The wires of a laid-out scene as the router would draw them, sampled as the deck samples the page.

### Notes

Every forward reference's route from the same `curveTo` and `threadedRoute` the page uses: a pin's point one pin radius outside its dot's centre, the dot's horizontal place from the capture, the hub's for a wire the registry sends to the hub; the lanes' passages from the column's cards' extent less and plus the lane margin at the slot's line; a self-reference and a reference read back are stubs, not routes. The path's commands (M, L, C, Q) are traced finely, the length taken from the fine trace, and the trace resampled every eight pixels from its start with its end kept, which is how the deck reads a drawn wire, so the horizontal and vertical parts summed over the samples are the deck's. On the five-file baseline the lab's length is within sixty pixels of the deck's 373,863 and the parts exact (2026-10-06).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SAMPLE_PX` {#symbol-sample_px}
- Type: const
- Source: [source](../../../../scripts/layout-lab/routes.ts#L21)

##### `SAMPLE_PX` — Summary
The deck's sampling step along a wire.

#### `Route` {#symbol-route}
- Type: interface
- Source: [source](../../../../scripts/layout-lab/routes.ts#L24)

##### `Route` — Summary
One wire as the page would draw it, with its measures.

#### `CardRect` {#symbol-cardrect}
- Type: interface
- Source: [source](../../../../scripts/layout-lab/routes.ts#L40)

##### `CardRect` — Summary
A card's rectangle in the picture's pixels.

#### `cardRects` {#symbol-cardrects}
- Type: function
- Source: [source](../../../../scripts/layout-lab/routes.ts#L43)
- Parameters: `scene`: [`Scene`](../../packages/explorer/src/client/views/localView/branch-scene.ts.mdmd.md#symbol-scene)

##### `cardRects` — Summary
Every card's rectangle in the picture.

#### `routeScene` {#symbol-routescene}
- Type: function
- Source: [source](../../../../scripts/layout-lab/routes.ts#L54)
- Returns: [`Route`](#symbol-route)[]
- Parameters: `scene`: [`Scene`](../../packages/explorer/src/client/views/localView/branch-scene.ts.mdmd.md#symbol-scene); `branches`: [`BranchGraph`](../../packages/explorer/src/client/views/localView/branches.ts.mdmd.md#symbol-branchgraph); `capture`: [`Capture`](./capture.ts.mdmd.md#symbol-capture); `bezier`: [`BezierTuning`](../../packages/explorer/src/client/types.ts.mdmd.md#symbol-beziertuning)

##### `routeScene` — Summary
The routes of every forward reference; a self-reference and a reference read back are stubs, not routes.

#### `tracePath` {#symbol-tracepath}
- Type: function
- Source: [source](../../../../scripts/layout-lab/routes.ts#L110)
- Returns: [`RoutePoint`](../../packages/explorer/src/client/views/localView/branch-routing.ts.mdmd.md#symbol-routepoint)[]

##### `tracePath` — Summary
The path's commands (M, L, C, Q, as the routing module writes them) traced finely into a polyline.

#### `lengthOf` {#symbol-lengthof}
- Type: function
- Source: [source](../../../../scripts/layout-lab/routes.ts#L143)

##### `lengthOf` — Summary
The length of a polyline.

#### `resample` {#symbol-resample}
- Type: function
- Source: [source](../../../../scripts/layout-lab/routes.ts#L150)
- Returns: [`RoutePoint`](../../packages/explorer/src/client/views/localView/branch-routing.ts.mdmd.md#symbol-routepoint)[]

##### `resample` — Summary
The polyline's points every `step` along its length, from its start, and its end.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.BezierTuning`](../../packages/explorer/src/client/types.ts.mdmd.md#symbol-beziertuning) (type-only)
- [`branch-routing.LANE_MARGIN`](../../packages/explorer/src/client/views/localView/branch-routing.ts.mdmd.md#symbol-lane_margin)
- [`branch-routing.Passage`](../../packages/explorer/src/client/views/localView/branch-routing.ts.mdmd.md#symbol-passage)
- [`branch-routing.RoutePoint`](../../packages/explorer/src/client/views/localView/branch-routing.ts.mdmd.md#symbol-routepoint)
- [`branch-routing.curveTo`](../../packages/explorer/src/client/views/localView/branch-routing.ts.mdmd.md#symbol-curveto)
- [`branch-routing.threadedRoute`](../../packages/explorer/src/client/views/localView/branch-routing.ts.mdmd.md#symbol-threadedroute)
- [`branch-scene.Scene`](../../packages/explorer/src/client/views/localView/branch-scene.ts.mdmd.md#symbol-scene) (type-only)
- [`branches.BranchGraph`](../../packages/explorer/src/client/views/localView/branches.ts.mdmd.md#symbol-branchgraph)
- [`branches.edgeKey`](../../packages/explorer/src/client/views/localView/branches.ts.mdmd.md#symbol-edgekey)
- [`Capture`](./capture.ts.mdmd.md#symbol-capture) (type-only)
- [`card-model.CardMetrics`](./card-model.ts.mdmd.md#symbol-cardmetrics-interface) (type-only)
- [`card-model.resolvePin`](./card-model.ts.mdmd.md#symbol-resolvepin) (type-only)
<!-- LIVE-DOC:END Dependencies -->
