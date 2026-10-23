# packages/explorer/src/client/views/forceGraphBatches.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/forceGraphBatches.ts
- Generated At: 2026-10-23T22:17:27.144Z

## Authored
### Purpose
Batch the 3D Local Map’s native sphere, tube and arrow meshes into shared WebGL draws, preserving their geometry, transforms, colours, alpha and depth rules while the original objects continue to supply picking and drag identity.

### Notes
Created in the [October 23 identity/framing pass](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-23.1.record.md#turn-5) after useful wider framing exposed a drawing bottleneck: the same graph settled by 15.3 seconds in the previous close-up and 36.4 seconds in the wider view, with labels contributing little layout cost. The owner explicitly included rendering performance. Native meshes are hidden only during drawing; scene hooks restore them before the next interaction pass. The `spatialBatch` reference identifies each proxy’s actual InstancedMesh and slot. Spheres and straight unit tubes share their native segment/cap geometry with radius moved into the instance transform. Other geometry retains its own shape. Native material and render-order differences stay separate; instance colour and an alpha attribute preserve attention. Transparent instances are sorted back to front. Conservative frustum culling includes tube width instead of trusting a long wire’s loose bounding sphere. Departed objects release their instance records; surviving records remain stable when depth ordering changes their slots.

The native library still advances interaction and physics each frame. The complete postprocessing pass runs only when the camera or projection, canvas/background, native membership, geometry versions, transforms, visibility or material appearance changed. Camera matrices are compared at their actual Float32 upload precision against the last drawn frame, so sub-precision damping costs no draw and incremental movement still accumulates. The renderer therefore releases its drawing cost while the scene is idle; a restored WebGL context forces another draw. This changes no motion threshold or graph membership.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SpatialBatchInstance` {#symbol-spatialbatchinstance}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphBatches.ts#L6)

##### `SpatialBatchInstance` — Summary
The instance actually drawn for a native graph object's picking/placement proxy; its slot can change with depth.

#### `drawSpatialGraphOnChange` {#symbol-drawspatialgraphonchange}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphBatches.ts#L19)
- Parameters: `scene`: [`Scene`](./localView/branch-scene.ts.mdmd.md#symbol-scene); `camera`: [`Camera`](./worldMap/projection.ts.mdmd.md#symbol-camera); `renderer`: `WebGLRenderer`

##### `drawSpatialGraphOnChange` — Summary
Keep the library's interaction/physics loop running, but draw WebGL only when its picture changes.

#### `batchSpatialGraph` {#symbol-batchspatialgraph}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphBatches.ts#L67)
- Parameters: `scene`: [`Scene`](./localView/branch-scene.ts.mdmd.md#symbol-scene)

##### `batchSpatialGraph` — Summary
Instance the native sphere/tube shapes at their original sizes, retaining native objects for picking and dragging.
Each instance carries its world transform, linear colour and alpha. The native material keeps its depth rules.
Proxies are hidden only during WebGL drawing and restored before the next interaction pass.

#### `tubeIntersectsFrustum` {#symbol-tubeintersectsfrustum}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphBatches.ts#L203)
- Parameters: `matrix`: `Matrix4`; `frustum`: `Frustum`

##### `tubeIntersectsFrustum` — Summary
Conservatively clip a straight unit tube's axis against the frustum expanded by its radial support.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `three` - `BufferGeometry`, `Camera`, `Color`, `DynamicDrawUsage`, `Frustum`, `InstancedBufferAttribute`, `InstancedMesh`, `Matrix4`, `Mesh`, `MeshLambertMaterial`, `Scene`, `Sphere`, `Vector3`, `WebGLRenderer`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
