# `packages/explorer/src/client/views/localView/wire-reach.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/explorer/src/client/views/localView/wire-reach.ts`
- Generated At: 2026-11-22T19:55:40.423Z

## Authored
### Purpose
Finds the 2D wire under the pointer by arithmetic on the wire's own route: the route walked as a line of points, the distance from a point to it, and the wire at a point, the nearest of those within half their reach. Wire Answers asks it on every pointer move over the map's ground.

### Notes
- Written on 2026-11-22, when the day's gate found a card's More under the band of a wire between two other files: the wires stand above the cards, and a band twelve of the screen's pixels wide took the pointer from whatever card lay beside its lane. The root's ruling: a band takes no pointer, and "everything of a card takes the pointer before a wire's reach does; a wire's words never cost a reader a control". The record is [the arrival's evidence, tenth milestone](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-22/Screenshots/arrival-default/README.md).
- Arithmetic and not the browser's `isPointInStroke`, because the rule gives the pointer to the nearer of two wires, which needs a distance, and because the walk of a route (`pathPoints` in `wire-marks.ts`) was already in the product and needs no element. Measured on a picture of 221 bands: 0.2 ms a move at the median.
- The reach itself (twelve screen pixels, or the wire's width and six) is said in `wire-answers.ts` and `styles/local.css`; this module only measures.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Reach` {#symbol-reach}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/wire-reach.ts#L11)

##### `Reach` — Summary
A wire's reach for the pointer, by arithmetic (2026-11-22). A wire's band is twelve of the screen's pixels wide so that
a wire can be pointed at, and the wires stand above the cards, so a band that took the pointer took it from whatever
card stood beside its lane: zoomed out, a card's More lay under the band of a wire between two other files. A band now
takes no pointer. The wire under the pointer is found here, from the wire's own route walked as a line of points
({@link pathPoints}, the walk the direction marks already use), and only where the pointer's target is the map's
ground (wire-answers.ts): everything of a card takes the pointer before a wire's reach does.

#### `reachOf` {#symbol-reachof}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/wire-reach.ts#L21)
- Returns: [`Reach`](#symbol-reach)

##### `reachOf` — Summary
A route's reach: its points and the box that holds them; null where the route walks to fewer than two points.

#### `distanceTo` {#symbol-distanceto}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/wire-reach.ts#L38)
- Parameters: `reach`: [`Reach`](#symbol-reach)

##### `distanceTo` — Summary
The distance from a point to a route, to the nearest of its straight pieces.

#### `wireAt` {#symbol-wireat}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/wire-reach.ts#L56)
- Returns: `T`
- Parameters: `wires`: `Iterable`; `wire`: `T`

##### `wireAt` — Summary
The wire whose reach holds a point: of the wires within half their width of it, the nearest; of two as near, the later,
which is drawn over the earlier. Until 2026-11-22 the browser chose, and chose the later of any two whose bands held the
point, however near the other ran. `half` is asked only of a wire whose box, grown by `most`, holds the point.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`wire-marks.pathPoints`](./wire-marks.ts.mdmd.md#symbol-pathpoints)
<!-- LIVE-DOC:END Dependencies -->
