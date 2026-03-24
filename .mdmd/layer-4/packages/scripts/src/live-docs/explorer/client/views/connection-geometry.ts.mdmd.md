# packages/scripts/src/live-docs/explorer/client/views/connection-geometry.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/views/connection-geometry.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-views-connection-geometry-ts
- Generated At: 2026-03-24T03:05:19.169Z

## Authored
### Purpose

Pure-function SVG geometry for the Local Map: Bézier path computation, self-loop stub generation, gradient definitions, and rect/point primitives.

### Notes

- Created 2025-12-18 (Dev Day 49) in chat 2025-12-18.1.md Turn 06 as third of three pure-function module extractions.
- `computeBezierPath()` generates cubic Bézier SVG `d` strings with tunable control point distances.
- `computeSelfLoopStubs()` handles intra-node symbol connections (same file, different symbols).
- `createConnectionGradient()` returns `GradientDef` for directional color transitions.
- Geometric primitives (`Point`, `Rect`, `distance`, `rectCenter`, `mergeRects`) enable unit-testable arc fitting.
- 385 lines of geometry, all unit-testable without DOM.
- Promoted from `localView/connection-geometry.ts` to `views/connection-geometry.ts` during Step 0 of the Membrane Map implementation (Dev Day 81).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-03-24T03:05:19.169Z","inputHash":"804852913a295751"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Point` {#symbol-point}
- Type: interface
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/connection-geometry.ts#L16)

##### `Point` — Summary
A 2D point in the coordinate system.

#### `Rect` {#symbol-rect}
- Type: interface
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/connection-geometry.ts#L24)

##### `Rect` — Summary
A rectangle defined by its edges.

#### `BezierTuningParams` {#symbol-beziertuningparams}
- Type: interface
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/connection-geometry.ts#L34)

##### `BezierTuningParams` — Summary
Tuning parameters for Bezier curve generation.

#### `DEFAULT_BEZIER_TUNING` {#symbol-default_bezier_tuning}
- Type: const
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/connection-geometry.ts#L48)
- Returns: [`BezierTuningParams`](#symbol-beziertuningparams)

##### `DEFAULT_BEZIER_TUNING` — Summary
Default Bezier tuning that produces aesthetically pleasing curves.

#### `PathResult` {#symbol-pathresult}
- Type: interface
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/connection-geometry.ts#L58)

##### `PathResult` — Summary
Result of path computation, containing the SVG path data string.

#### `computeStubLength` {#symbol-computestublength}
- Type: function
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/connection-geometry.ts#L75)
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
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/connection-geometry.ts#L102)
- Returns: [`PathResult`](./localView/state.ts.mdmd.md#symbol-pathresult)
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
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/connection-geometry.ts#L157)
- Parameters: `a`: [`Point`](#symbol-point); `b`: [`Point`](#symbol-point)

##### `distance` — Summary
Euclidean distance between two points.

#### `SelfLoopParams` {#symbol-selfloopparams}
- Type: interface
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/connection-geometry.ts#L166)

##### `SelfLoopParams` — Summary
Parameters for self-loop "French Corset" stubs.

#### `DEFAULT_SELF_LOOP_PARAMS` {#symbol-default_self_loop_params}
- Type: const
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/connection-geometry.ts#L180)
- Returns: [`SelfLoopParams`](#symbol-selfloopparams)

##### `DEFAULT_SELF_LOOP_PARAMS` — Summary
Default self-loop parameters for the "French Corset" effect.

#### `SelfLoopStubResult` {#symbol-selfloopstubresult}
- Type: interface
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/connection-geometry.ts#L191)

##### `SelfLoopStubResult` — Summary
Result of self-loop stub computation.
Self-loops render as two small stubs that "imply" a connection behind the card.

#### `computeSelfLoopStubs` {#symbol-computeselfloopstubs}
- Type: function
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/connection-geometry.ts#L210)
- Returns: [`SelfLoopStubResult`](#symbol-selfloopstubresult)
- Parameters: `source`: [`Point`](#symbol-point); `target`: [`Point`](#symbol-point); `params`: [`SelfLoopParams`](#symbol-selfloopparams)

##### `computeSelfLoopStubs` — Summary
Computes the polygon points for self-loop "French Corset" stubs.

Self-loops occur when a symbol references another symbol on the same node.
Rather than drawing a complex looping bezier, we render two small "nubs"
that suggest the connection wraps around behind the card.

##### `computeSelfLoopStubs` — Parameters
- `params`: Self-loop styling parameters
- `source`: The provider pin position (outbound side)
- `target`: The consumer pin position (inbound side)

##### `computeSelfLoopStubs` — Returns
Polygon point strings for both stubs

#### `offsetToPinEdge` {#symbol-offsettopinedge}
- Type: function
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/connection-geometry.ts#L261)
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
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/connection-geometry.ts#L275)
- Returns: [`Point`](#symbol-point)
- Parameters: `rect`: [`Rect`](#symbol-rect)

##### `rectCenter` — Summary
Computes the center point of a rectangle.

#### `rectSize` {#symbol-rectsize}
- Type: function
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/connection-geometry.ts#L285)
- Parameters: `rect`: [`Rect`](#symbol-rect)

##### `rectSize` — Summary
Computes the dimensions of a rectangle.

#### `expandRect` {#symbol-expandrect}
- Type: function
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/connection-geometry.ts#L295)
- Returns: [`Rect`](#symbol-rect)
- Parameters: `rect`: [`Rect`](#symbol-rect)

##### `expandRect` — Summary
Expands a rectangle by a given margin on all sides.

#### `boundingBoxFromPoints` {#symbol-boundingboxfrompoints}
- Type: function
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/connection-geometry.ts#L307)
- Returns: [`Rect`](#symbol-rect)
- Parameters: `points`: [`Point`](#symbol-point)[]

##### `boundingBoxFromPoints` — Summary
Computes the bounding box that contains all given points.

#### `mergeRects` {#symbol-mergerects}
- Type: function
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/connection-geometry.ts#L328)
- Returns: [`Rect`](#symbol-rect)
- Parameters: `rects`: [`Rect`](#symbol-rect)[]

##### `mergeRects` — Summary
Merges multiple rectangles into their bounding box.

#### `GradientDef` {#symbol-gradientdef}
- Type: interface
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/connection-geometry.ts#L342)

##### `GradientDef` — Summary
Linear gradient definition for path coloring.

#### `createConnectionGradient` {#symbol-createconnectiongradient}
- Type: function
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/connection-geometry.ts#L364)
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

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [connection-geometry.test.ts](./connection-geometry.test.ts.mdmd.md)
- [pin-state.test.ts](./membraneView/pin-state.test.ts.mdmd.md)
- [routing.test.ts](./membraneView/routing.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
