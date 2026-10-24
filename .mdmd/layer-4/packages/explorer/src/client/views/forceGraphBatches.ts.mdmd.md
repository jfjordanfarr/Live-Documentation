# packages/explorer/src/client/views/forceGraphBatches.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/forceGraphBatches.ts
- Generated At: 2026-10-24T19:41:34.770Z

## Authored
### Purpose
Batch the 3D Local Map's spheres, projected wires and arrows into shared WebGL draws. Preserve object identity, colours, alpha and depth rules while independent node and wire resistance controls determine their apparent sizes.

### Notes
Created in the [October 23 identity/framing pass](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-23.1.record.md#turn-5) after useful wider framing exposed a drawing bottleneck: the same graph settled by 15.3 seconds in the previous close-up and 36.4 seconds in the wider view, with labels contributing little layout cost. The owner explicitly included rendering performance. Native meshes are hidden only during drawing; scene hooks restore them before the next interaction pass. The `spatialBatch` reference identifies each proxy's actual InstancedMesh and slot. Spheres share native tessellation, with their radius carried in the instance transform. Other geometry retains its shape. Native material and render-order differences stay separate; instance colour and alpha preserve attention. Transparent instances are sorted back to front. Departed objects release their instance records; surviving records remain stable when depth ordering changes their slots.

The owner's [October 24 resistance request](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-24.1.record.md#turn-11) replaced straight tube drawing with round-capped projected strokes based on Three's wide-line shader. Each endpoint's depth supplies its resistance-adjusted width; near/far clipping, end-on caps and picking agree with `forceGraphSizing.ts`. Homogeneous culling includes the visible stroke's width. Sphere proxies receive the same compensation as their drawn instances, preserving native picking and dragging; removed nodes and disposal restore their original scales. Native physical sizes remain the layout's concern.

The native library still advances interaction and physics each frame. The complete postprocessing pass runs only when the camera or projection, canvas/background, native membership, geometry versions, transforms, visibility or material appearance changed. Camera matrices are compared at their actual Float32 upload precision against the last drawn frame, so sub-precision damping costs no draw and incremental movement still accumulates. The renderer therefore releases its drawing cost while the scene is idle; a restored WebGL context forces another draw. This changes no motion threshold or graph membership.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SpatialBatchInstance` {#symbol-spatialbatchinstance}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphBatches.ts#L11)

##### `SpatialBatchInstance` — Summary
The instance actually drawn for a native graph object's picking/placement proxy; its slot can change with depth.

#### `drawSpatialGraphOnChange` {#symbol-drawspatialgraphonchange}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphBatches.ts#L24)
- Parameters: `scene`: [`Scene`](./localView/branch-scene.ts.mdmd.md#symbol-scene); `camera`: [`Camera`](./worldMap/projection.ts.mdmd.md#symbol-camera); `renderer`: `WebGLRenderer`

##### `drawSpatialGraphOnChange` — Summary
Keep the library's interaction/physics loop running, but draw WebGL only when its picture changes.

#### `batchSpatialGraph` {#symbol-batchspatialgraph}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphBatches.ts#L73)
- Parameters: `scene`: [`Scene`](./localView/branch-scene.ts.mdmd.md#symbol-scene)

##### `batchSpatialGraph` — Summary
Instance spheres and straight wires with independent zoom resistance; keep arrows at their native size.
Each instance carries its world transform, linear colour and alpha. Keep native depth rules and interaction proxies.
Proxies are hidden only during WebGL drawing and restored before the next interaction pass.

#### `screenWireIntersectsFrustum` {#symbol-screenwireintersectsfrustum}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphBatches.ts#L253)
- Parameters: `clipMatrix`: `Matrix4`; `viewport`: `Vector2`

##### `screenWireIntersectsFrustum` — Summary
Clip a unit wire's axis in homogeneous coordinates, allowing its CSS-pixel half width and round caps.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`forceGraphSizing.clipSpatialWireDepth`](./forceGraphSizing.ts.mdmd.md#symbol-clipspatialwiredepth)
- [`forceGraphSizing.pickSpatialWire`](./forceGraphSizing.ts.mdmd.md#symbol-pickspatialwire)
- [`forceGraphSizing.spatialSizeScale`](./forceGraphSizing.ts.mdmd.md#symbol-spatialsizescale)
- `three` - `BufferGeometry`, `Camera`, `Color`, `DynamicDrawUsage`, `Frustum`, `InstancedBufferAttribute`, `InstancedMesh`, `Material`, `Matrix4`, `Mesh`, `MeshLambertMaterial`, `Scene`, `Sphere`, `Vector2`, `Vector3`, `Vector4`, `WebGLRenderer`
- `three/addons/lines/LineMaterial.js` - `LineMaterial`
- `three/addons/lines/LineSegmentsGeometry.js` - `LineSegmentsGeometry`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
