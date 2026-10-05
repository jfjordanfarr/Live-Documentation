# packages/explorer/src/client/views/localView/branch-routing.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/branch-routing.ts
- Generated At: 2026-10-05T16:55:01.324Z

## Authored
### Purpose
The pure geometry of a Local Map wire: the native curve between two pins, and the threaded route of a reference that skips columns.

### Notes
A threaded route is curve, lane, curve, lane, curve: each curve lives in a gutter and each straight run in a lane the ordering reserved between two cards, so by construction it never reaches backward and never enters a card. The lane constants, 7 px per wire with 6 px above and below and a 10 px margin outside the column, are the room the renderer leaves and the router reads back. This replaced the orthogonal detour over the top of the whole picture on 2026-10-05, after the owner's October 3 criticism of "right-angle-ey hopping-over-a-column connectors" and their answer that routing is a balance of legibility, directionality and no overlaps rather than a rule.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `RoutePoint` {#symbol-routepoint}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-routing.ts#L4)

##### `RoutePoint` — Summary
A point in unscaled Local Map coordinates.

#### `LANE_PITCH` {#symbol-lane_pitch}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-routing.ts#L7)

##### `LANE_PITCH` — Summary
The vertical room each threaded wire takes in a lane, in CSS pixels.

#### `LANE_PADDING` {#symbol-lane_padding}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-routing.ts#L10)

##### `LANE_PADDING` — Summary
The room above and below a lane's wires, in CSS pixels.

#### `LANE_MARGIN` {#symbol-lane_margin}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-routing.ts#L13)

##### `LANE_MARGIN` — Summary
How far outside a column's cards a lane's straight run begins and ends, in CSS pixels.

#### `Passage` {#symbol-passage}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-routing.ts#L16)

##### `Passage` — Summary
A gap in a column a wire passes through: the column's horizontal extent, widened by a margin, at the lane's height.

#### `RoutePiece` {#symbol-routepiece}
- Type: type
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-routing.ts#L19)

##### `RoutePiece` — Summary
One piece of a threaded route: a curve across a gutter, or a straight run along a lane through a column.

#### `curveTo` {#symbol-curveto}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-routing.ts#L29)
- Parameters: `from`: [`RoutePoint`](#symbol-routepoint); `to`: [`RoutePoint`](#symbol-routepoint); `tuning`: [`BezierTuning`](../../types.ts.mdmd.md#symbol-beziertuning)

##### `curveTo` — Summary
The curve the Local Map draws between two pins: a cubic whose control points
leave and arrive horizontally, so a wire departs an offering pin to the right
and enters a using pin from the left; a near-vertical hop is a quadratic.
Returns the path commands after the move to `from`.

#### `threadedRoute` {#symbol-threadedroute}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-routing.ts#L54)
- Parameters: `from`: [`RoutePoint`](#symbol-routepoint); `to`: [`RoutePoint`](#symbol-routepoint); `tuning`: [`BezierTuning`](../../types.ts.mdmd.md#symbol-beziertuning)

##### `threadedRoute` — Summary
A wire that skips columns: from its offering pin it curves across the first
gutter into a lane through the next column, runs straight along that lane,
and curves on, until it enters its using pin. Every curve lives in a gutter
and every straight run in a lane, so the route never reaches backward and
never enters a card, given lanes that lie in gaps between cards.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.BezierTuning`](../../types.ts.mdmd.md#symbol-beziertuning) (type-only)
<!-- LIVE-DOC:END Dependencies -->
