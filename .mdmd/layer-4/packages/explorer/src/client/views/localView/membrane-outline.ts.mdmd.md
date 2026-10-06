# packages/explorer/src/client/views/localView/membrane-outline.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/membrane-outline.ts
- Generated At: 2026-10-06T17:29:23.669Z

## Authored
### Purpose

Traces the outline of a directory's membrane in the Local Map's placed layout: one rectangle per column the directory spans, each at the height the placement gave it, joined across every gutter by the part of the gutter where the two neighbouring rectangles overlap, as one closed rectilinear path the renderer draws beneath the cards.

### Notes

- The segments arrive left to right and each overlaps the next vertically, which the placement guarantees with its neck; the trace runs along the tops left to right, stepping at each gutter to the higher of the two tops, down the right edge of the last segment, back along the bottoms stepping to the lower of the two bottoms, and up the left edge of the first. Corners that repeat a point are dropped, so a level membrane has a rectangle's worth of corners and no more.
- Drawn, every corner is rounded by the renderer's radius, the membrane's padding, convex and concave alike, as a quadratic curve with the corner as its control point; a corner between short edges is rounded by half the shorter edge so neighbouring curves never overlap. The owner asked for the rounding on seeing the first membranes, "to sell their squishiness" (2026-10-06).
- Pure, with no DOM; the coordinates are the caller's. `branch-renderer.ts` passes segments relative to the directory's element and sets the result as the path's `d`. Written on 2026-10-06 when directories stopped being rectangles ([Turn 6](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-06.1.record.md#turn-6) of the October 6 session).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `OutlineSegment` {#symbol-outlinesegment}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/membrane-outline.ts#L16)

##### `OutlineSegment` — Summary
One column's rectangle of a membrane.

#### `OutlinePoint` {#symbol-outlinepoint}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/membrane-outline.ts#L24)

##### `OutlinePoint` — Summary
A corner of the outline.

#### `membraneOutline` {#symbol-membraneoutline}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/membrane-outline.ts#L37)
- Returns: [`OutlinePoint`](#symbol-outlinepoint)[]

##### `membraneOutline` — Summary
The outline's corners in drawing order, clockwise from the top-left of the
leftmost segment: along the tops left to right, stepping at each gutter to
the higher of the two tops, down the right edge of the last segment, back
along the bottoms stepping to the lower of the two bottoms, and up the left
edge of the first. Corners that repeat a point are dropped. Empty input
gives no points.

#### `membranePath` {#symbol-membranepath}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/membrane-outline.ts#L80)

##### `membranePath` — Summary
The outline as a closed SVG path, every corner rounded by `radius`, convex
and concave alike, as a quadratic curve with the corner as its control
point. A corner between short edges is rounded by half the shorter edge
instead, so neighbouring curves never overlap; a radius of zero draws the
corners sharp.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
