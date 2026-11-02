# packages/explorer/src/client/views/forceGraphSizing.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/forceGraphSizing.ts
- Generated At: 2026-11-02T02:09:51.324Z

## Authored
### Purpose
Keep the 3D Local Map's apparent sizes and hit testing consistent as its camera moves. Nodes and wires independently resist zoom using the camera’s orbit target as a shared reference, while retaining perspective depth and rigid world proportions during rotation. Clipped wire strokes are picked at the depth actually drawn.

### Notes
Created for the owner's [October 24 request for separate node and wire zoom resistance](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-24.1.record.md#turn-11), after constant-size nodes proved useful nearby but crowded the distant overview. If a world unit at the orbit target projects to `p` CSS pixels and resistance is `r`, the shared world scale compensation is `p^-r`. At that reference plane, apparent size changes with `p^(1-r)`; elsewhere ordinary perspective depth applies. Relative symbol sizes and reference-count widths remain intact; the physical layout uses its original radii. The [November 2 orbit correction](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-01.1.record.md#turn-6--november-2-the-3d-exploration-pass) replaces the earlier per-object depth compensation, which changed world-space body and wire sizes as the camera rotated. The renderer passes its actual target, including after pan or reframing, rather than assuming the origin.

Wire picking clips both endpoints to the camera's near/far interval before computing their widths. Width tapers linearly across the projected segment, and hit depth follows projected interpolation. An end-on stroke is the nearer endpoint's full round cap regardless of edge direction. The batch shader follows the same rules; real GPU pixel tests complement the pure geometry cases.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `pixelsPerWorldUnit` {#symbol-pixelsperworldunit}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphSizing.ts#L4)
- Parameters: `point`: `Vector3`; `camera`: [`Camera`](./worldMap/projection.ts.mdmd.md#symbol-camera)

##### `pixelsPerWorldUnit` — Summary
CSS pixels per world unit at a point's depth; behind-camera points have no visible size.

#### `spatialSizeScale` {#symbol-spatialsizescale}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphSizing.ts#L12)
- Parameters: `target`: `Vector3`; `camera`: [`Camera`](./worldMap/projection.ts.mdmd.md#symbol-camera)

##### `spatialSizeScale` — Summary
Shared world-scale compensation at the orbit target: resist zoom without changing relative sizes during orbit.

#### `clipSpatialWireDepth` {#symbol-clipspatialwiredepth}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphSizing.ts#L18)
- Parameters: `start`: `Vector4`; `end`: `Vector4`

##### `clipSpatialWireDepth` — Summary
Clip homogeneous endpoints to the visible depth interval; return their parameters on the original segment.

#### `pickSpatialWire` {#symbol-pickspatialwire}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphSizing.ts#L33)
- Parameters: `matrix`: `Matrix4`; `camera`: [`Camera`](./worldMap/projection.ts.mdmd.md#symbol-camera); `viewport`: `Vector2`; `ray`: `Ray`

##### `pickSpatialWire` — Summary
Pick a round-capped wire by its projected, possibly tapered stroke, including near/far clipping.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `three` - `Camera`, `Matrix4`, `Ray`, `Vector2`, `Vector3`, `Vector4`
<!-- LIVE-DOC:END Dependencies -->
