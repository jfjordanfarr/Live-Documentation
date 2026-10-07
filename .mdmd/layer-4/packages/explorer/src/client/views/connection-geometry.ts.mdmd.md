# packages/explorer/src/client/views/connection-geometry.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/connection-geometry.ts
- Generated At: 2026-10-07T01:30:16.603Z

## Authored
### Purpose

Pure-function SVG geometry for the Local Map: Bézier path computation, the French Corset's laces for a self-reference, gradient definitions, and rect/point primitives.

### Notes

- Created 2025-12-18 (Dev Day 49) in chat 2025-12-18.1.md Turn 06 as third of three pure-function module extractions.
- `computeBezierPath()` generates cubic Bézier SVG `d` strings with tunable control point distances.
- `computeSelfLoopStubs()` draws a self-reference, a symbol referring to another on the same card, as two laces: at each pin a tapered polygon that leaves the pin outward, turns toward the partner's row and returns to the card's edge one pin radius inward, so that it reads as one wire passing behind the card. Until 2026-10-06 each end was a straight tapered stub curling toward the partner; two such stubs leaving one pin toward partners above and below met as a chevron that read as an arrowhead, which the owner saw at graph.ts's DocLocation pin ([Turn 14](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-05.1.record.md#turn-14)) and answered with the loop-around shape ([Turn 15](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-05.1.record.md#turn-15)). The laces of one pin that turn the same way nest outward by `LACE_PITCH`, sharing their return, so a row referred to from several rows shows as many laces. The tests hold the geometry: the lace starts at the pin's edge at its full width, ends on the card's edge toward the partner, never reaches inside the card past the pin, nests by rank, and thins by the taper.
- The laces' shape is three numbers and the taper (`reach`, how far beyond the card's edge the lace sweeps; `curlAmount`, how far along the edge it comes back; `baseWidth`; `taper`), the Local Map tuning's dials since 2026-10-06, so the owner can tune the shape by eye in the page ([Turn 13](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-06.1.record.md#turn-13)). Since 2026-10-07 the lace is a hairpin of two quarter ellipses whose return is cut flush where the card's edge begins, the edges given by the caller as `LaceEdges`, after the owner's marked-up picture showed what "going behind" the card must look like ([Turn 14](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-06.1.record.md#turn-14)); the return inset of the night before went with it, having nothing left to show. The hidden middle between the two laces, one cubic across the card shown through it on hover, was tried the same night and set aside by the owner's eye: it gave no impression of "behind" and its dashed strokes fought the rows' text. The pictures stay under `AI-Agent-Workspace/Screenshots/2026-10-06/`, the cut's under `AI-Agent-Workspace/Screenshots/2026-10-07/`.
- `createConnectionGradient()` returns `GradientDef` for directional color transitions.
- Geometric primitives (`Point`, `Rect`, `distance`, `rectCenter`, `mergeRects`) enable unit-testable arc fitting.
- 385 lines of geometry, all unit-testable without DOM.
- Promoted from `localView/connection-geometry.ts` to `views/connection-geometry.ts` during Step 0 of the Membrane Map implementation (Dev Day 81).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Point` {#symbol-point}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/connection-geometry.ts#L16)

##### `Point` — Summary
A 2D point in the coordinate system.

#### `Rect` {#symbol-rect}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/connection-geometry.ts#L24)

##### `Rect` — Summary
A rectangle defined by its edges.

#### `BezierTuningParams` {#symbol-beziertuningparams}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/connection-geometry.ts#L34)

##### `BezierTuningParams` — Summary
Tuning parameters for Bezier curve generation.

#### `DEFAULT_BEZIER_TUNING` {#symbol-default_bezier_tuning}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/connection-geometry.ts#L48)
- Returns: [`BezierTuningParams`](#symbol-beziertuningparams)

##### `DEFAULT_BEZIER_TUNING` — Summary
Default Bezier tuning that produces aesthetically pleasing curves.

#### `PathResult` {#symbol-pathresult}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/connection-geometry.ts#L58)

##### `PathResult` — Summary
Result of path computation, containing the SVG path data string.

#### `computeStubLength` {#symbol-computestublength}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/connection-geometry.ts#L75)
- Parameters: `tuning`: [`BezierTuningParams`](#symbol-beziertuningparams)

##### `computeStubLength` — Summary
Computes control point distance ("stub length") for Bezier curves.

The stub determines how far from the endpoint the control points are placed,
affecting the curve's initial direction and curvature.

##### `computeStubLength` — Parameters
- `horizontalGap`: Absolute horizontal distance between endpoints
- `tuning`: Bezier tuning parameters

##### `computeStubLength` — Returns
The stub length in pixels

#### `computeBezierPath` {#symbol-computebezierpath}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/connection-geometry.ts#L102)
- Returns: [`PathResult`](#symbol-pathresult)
- Parameters: `source`: [`Point`](#symbol-point); `target`: [`Point`](#symbol-point); `tuning`: [`BezierTuningParams`](#symbol-beziertuningparams)

##### `computeBezierPath` — Summary
Computes a cubic Bezier curve path between two points.

The curve flows horizontally from source to target, with control points
creating a smooth S-curve when there's vertical displacement.

##### `computeBezierPath` — Parameters
- `source`: Starting point (typically the "outbound" pin)
- `target`: Ending point (typically the "inbound" pin)
- `tuning`: Optional Bezier tuning parameters

##### `computeBezierPath` — Returns
PathResult with SVG path data

##### `computeBezierPath` — Examples
```typescript
const path = computeBezierPath(
  { x: 100, y: 200 },
  { x: 400, y: 250 },
  DEFAULT_BEZIER_TUNING
);
// path.d = "M 100 200 C 160 207.5 340 242.5 400 250"
```

#### `distance` {#symbol-distance}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/connection-geometry.ts#L157)
- Parameters: `a`: [`Point`](#symbol-point); `b`: [`Point`](#symbol-point)

##### `distance` — Summary
Euclidean distance between two points.

#### `SelfLoopParams` {#symbol-selfloopparams}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/connection-geometry.ts#L169)

##### `SelfLoopParams` — Summary
Parameters for the laces of a self-reference, the "French Corset": at each
of its two pins a lace leaves the pin, sweeps out past the card's edge,
turns toward the partner and comes back, to be cut by the card's edge as a
wire passing behind the card would be.

#### `DEFAULT_SELF_LOOP_PARAMS` {#symbol-default_self_loop_params}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/connection-geometry.ts#L184)
- Returns: [`SelfLoopParams`](#symbol-selfloopparams)

##### `DEFAULT_SELF_LOOP_PARAMS` — Summary
Default lace parameters. The Local Map's tuning carries the same four numbers as dials (`laceReach`, `laceCurl`,
`laceWidth`, `selfLoopTaper`), so the shape can be tuned by eye in the page (the owner's ask, 2026-10-06).

#### `LACE_PITCH` {#symbol-lace_pitch}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/connection-geometry.ts#L192)

##### `LACE_PITCH` — Summary
Laces of one pin that turn the same way stand each this much further out, nested, sharing their return.

#### `LaceEdges` {#symbol-laceedges}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/connection-geometry.ts#L201)

##### `LaceEdges` — Summary
The card edges a self-reference's two laces are cut by, as x coordinates in the laces' own frame.

#### `SelfLoopStubResult` {#symbol-selfloopstubresult}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/connection-geometry.ts#L211)

##### `SelfLoopStubResult` — Summary
The two laces of a self-reference, as SVG polygon point strings.

#### `computeSelfLoopStubs` {#symbol-computeselfloopstubs}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/connection-geometry.ts#L237)
- Returns: [`SelfLoopStubResult`](#symbol-selfloopstubresult)
- Parameters: `source`: [`Point`](#symbol-point); `target`: [`Point`](#symbol-point); `edges`: [`LaceEdges`](#symbol-laceedges); `params`: [`SelfLoopParams`](#symbol-selfloopparams)

##### `computeSelfLoopStubs` — Summary
Computes the two laces of a self-reference, a symbol referring to another on
the same card. No route is drawn between them: the provider's lace leaves
its pin outward, past its card's right edge, turns toward the consumer's row
and comes back, and the consumer's lace does the same past its card's left
edge toward the provider's row. Each is cut flush where its card's edge
begins, so that it reads as one wire that passes behind the card: the
owner's picture of 2026-10-07 painted the card's colour over every return
from the border inward, and this is that picture drawn. A lace that turns
back is a shape no wire between cards ever makes, and two laces of one pin,
one turning up and one down, make a bracket rather than an arrowhead, which
two straight stubs did (the owner's note, 2026-10-06).

##### `computeSelfLoopStubs` — Parameters
- `edges`: The card edges the two laces are cut by
- `params`: The laces' shape
- `ranks`: Each lace's place among the laces of its pin that turn the same way, from 0; later ones nest outward
- `source`: The provider pin's outer edge
- `target`: The consumer pin's outer edge

#### `offsetToPinEdge` {#symbol-offsettopinedge}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/connection-geometry.ts#L352)
- Returns: [`Point`](#symbol-point)
- Parameters: `center`: [`Point`](#symbol-point)

##### `offsetToPinEdge` — Summary
Offsets a point from the pin center to the pin edge.

Pins have a radius, and connections should start/end at the edge,
not the center. This function computes the edge position.

##### `offsetToPinEdge` — Parameters
- `center`: The pin's center point
- `direction`: Which edge to offset to ("inbound" = left, "outbound" = right)
- `pinRadius`: Radius of the pin circle

##### `offsetToPinEdge` — Returns
The point at the pin's edge

#### `rectCenter` {#symbol-rectcenter}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/connection-geometry.ts#L366)
- Returns: [`Point`](#symbol-point)
- Parameters: `rect`: [`Rect`](#symbol-rect)

##### `rectCenter` — Summary
Computes the center point of a rectangle.

#### `rectSize` {#symbol-rectsize}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/connection-geometry.ts#L376)
- Parameters: `rect`: [`Rect`](#symbol-rect)

##### `rectSize` — Summary
Computes the dimensions of a rectangle.

#### `expandRect` {#symbol-expandrect}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/connection-geometry.ts#L386)
- Returns: [`Rect`](#symbol-rect)
- Parameters: `rect`: [`Rect`](#symbol-rect)

##### `expandRect` — Summary
Expands a rectangle by a given margin on all sides.

#### `boundingBoxFromPoints` {#symbol-boundingboxfrompoints}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/connection-geometry.ts#L398)
- Returns: [`Rect`](#symbol-rect)
- Parameters: `points`: [`Point`](#symbol-point)[]

##### `boundingBoxFromPoints` — Summary
Computes the bounding box that contains all given points.

#### `mergeRects` {#symbol-mergerects}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/connection-geometry.ts#L419)
- Returns: [`Rect`](#symbol-rect)
- Parameters: `rects`: [`Rect`](#symbol-rect)[]

##### `mergeRects` — Summary
Merges multiple rectangles into their bounding box.

#### `GradientDef` {#symbol-gradientdef}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/connection-geometry.ts#L433)

##### `GradientDef` — Summary
Linear gradient definition for path coloring.

#### `createConnectionGradient` {#symbol-createconnectiongradient}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/connection-geometry.ts#L455)
- Returns: [`GradientDef`](#symbol-gradientdef)
- Parameters: `source`: [`Point`](#symbol-point); `target`: [`Point`](#symbol-point)

##### `createConnectionGradient` — Summary
Creates a gradient definition for connection path coloring.

The gradient flows from source (outbound/blue) to target (inbound/green),
with breathing room at the endpoints.

##### `createConnectionGradient` — Parameters
- `id`: Unique ID for the gradient
- `source`: Start point of the path
- `sourceColor`: Color at the source end (default: sky-400 blue)
- `target`: End point of the path
- `targetColor`: Color at the target end (default: emerald-400 green)

##### `createConnectionGradient` — Returns
GradientDef ready for SVG rendering
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
