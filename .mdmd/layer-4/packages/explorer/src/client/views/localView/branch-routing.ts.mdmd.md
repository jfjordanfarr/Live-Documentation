# packages/explorer/src/client/views/localView/branch-routing.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/branch-routing.ts
- Generated At: 2026-11-07T11:16:37.760Z

## Authored
### Purpose
The pure geometry of a Local Map wire: the native curve between two pins, and the threaded route of a reference that skips columns.

### Notes
A threaded route is curve, lane, curve, lane, curve: each curve lives in a gutter and each straight run in a lane the ordering reserved between two cards, so by construction it never reaches backward and never enters a card. The lane constants, a 7 px slot per bundle, which is the least between neighbouring wires, 6 px above the first slot and below the last, and a 10 px margin outside the column, are the least room the renderer leaves and the router reads back; since 2026-10-06 the placement spreads a lane's slots further apart where the wires through them ask. This replaced the orthogonal detour over the top of the whole picture on 2026-10-05, after the owner's October 3 criticism of "right-angle-ey hopping-over-a-column connectors" and their answer that routing is a balance of legibility, directionality and no overlaps rather than a rule.

The backward-route predicate checks actual segment direction and the symmetric cubic’s minimum horizontal derivative, including internal lane reversals. The renderer applies it only to ordinary visible connections, excluding intentional self loops and feedback stubs. A settled backward route outlines the 3D switch; the cue clears when the route no longer goes backward. This follows the [November 2 request](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-01.1.record.md#turn-6--november-2-the-3d-exploration-pass).

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
A lane slot's height, the least room between neighbouring wires through a lane, in CSS pixels; the placement may spread them further.

#### `LANE_PADDING` {#symbol-lane_padding}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-routing.ts#L10)

##### `LANE_PADDING` — Summary
The room between a lane's edge and its first or last slot, in CSS pixels.

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

#### `routeBacktracks` {#symbol-routebacktracks}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-routing.ts#L27)
- Parameters: `tuning`: [`BezierTuning`](../../types.ts.mdmd.md#symbol-beziertuning)

##### `routeBacktracks` — Summary
Whether an ordinary routed connection ever travels left, including a curve whose horizontal controls overshoot.

#### `curveTo` {#symbol-curveto}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-routing.ts#L41)
- Parameters: `from`: [`RoutePoint`](#symbol-routepoint); `to`: [`RoutePoint`](#symbol-routepoint); `tuning`: [`BezierTuning`](../../types.ts.mdmd.md#symbol-beziertuning)

##### `curveTo` — Summary
The curve the Local Map draws between two pins: a cubic whose control points
leave and arrive horizontally, so a wire departs an offering pin to the right
and enters a using pin from the left; a near-vertical hop is a quadratic.
Returns the path commands after the move to `from`.

#### `Clearance` {#symbol-clearance}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-routing.ts#L61)

##### `Clearance` — Summary
Where a wire's own columns end, in the route's coordinates: the x past which the offering column's gutter begins, and
the x before which the using column's gutter ends; each a column's extent widened by the lane margin, as a passage is.

#### `threadedRoute` {#symbol-threadedroute}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-routing.ts#L82)
- Parameters: `from`: [`RoutePoint`](#symbol-routepoint); `to`: [`RoutePoint`](#symbol-routepoint); `tuning`: [`BezierTuning`](../../types.ts.mdmd.md#symbol-beziertuning); `clearance`: [`Clearance`](#symbol-clearance)

##### `threadedRoute` — Summary
A wire that skips columns: from its offering pin it curves across the first
gutter into a lane through the next column, runs straight along that lane,
and curves on, until it enters its using pin. Every curve lives in a gutter
and every straight run in a lane, so the route never reaches backward and
never enters a card, given lanes that lie in gaps between cards.

A pin can stand inside its column's extent: a column holds the cards of
several directory bands, each band's as wide as its own text asks and set
in by its depth, so a card can end well before the column's widest does.
A curve begun at such a pin dives while still over the column, through the
membrane and the lane ends of the bands below (seen 2026-11-06 and again
2026-11-07, the wires of `compressed-url-state.ts` cutting a corner of the
layout lab's membrane). Given the clearance, the wire first runs straight
from its pin to where the gutter begins, and arrives straight from where the
gutter ends to its pin; those runs are commands of the path, not pieces, so
the pieces stay the curve into each lane and the run along it, in pairs,
which a bundle's shared run reads by index.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.BezierTuning`](../../types.ts.mdmd.md#symbol-beziertuning) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
