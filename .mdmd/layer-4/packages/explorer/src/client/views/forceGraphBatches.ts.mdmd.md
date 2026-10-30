# packages/explorer/src/client/views/forceGraphBatches.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/forceGraphBatches.ts
- Generated At: 2026-10-29T20:11:41.054Z

## Authored
### Purpose
Packs the 3D Local Map's nodes, projected wires and citation arrows directly into shared GPU instance buffers. Keeps stable picking identities, physical radii, colour/alpha, transparent depth order and independent node/wire zoom resistance without a scene object per graph element.

### Notes
Created in the [October 23 identity/framing pass](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-23.1.record.md#turn-5), when wider framing exposed a drawing bottleneck: the same graph settled by 15.3 seconds in the previous close-up and 36.4 seconds in the wider view. The first implementation batched native scene meshes while retaining them as placement/picking proxies. That representation still spent hundreds of milliseconds rebuilding batches for T3. The owner approved direct batches in [October 29, Turn 10](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/Summarized/2026-10-29.1.SUMMARIZED.md#turn-10), after [CPU/GPU measurements](../../../../../../../AI-Agent-Workspace/Probes/2026-10-29/t3-freeze/README.md#the-first-repair-did-not-resolve-usability) separated that preparation cost from drawing itself.

Mutable layout positions are read once per draw into packed numeric arrays. Wires bind to numeric endpoint indices when membership changes; projection, cached appearance, bounds and depth sorting then use contiguous numeric inputs rather than repeated reads through graph objects. Projection is shared at node endpoints, including across every incident wire. Exact double-precision depth sorting starts from the preceding order, with creation order for ties; attributes are written directly into their new slots. Stable datum bindings still identify uploaded slots for picking. These reduce CPU preparation without changing the visible set or making subpixel elements unpickable.

The scene holds one instanced mesh each for spheres, wires and arrows. A datum owns a stable binding to a slot, retained across changes when the view retains that datum; the slot may change when depth order changes. Buffers grow geometrically and release old GPU attributes before replacing them. Invisible and culled members stay addressable after the drawn prefix, preserving the distinction between graph membership and what the camera sees. Sphere tessellation remains twelve segments. Nodes and arrows write depth; translucent wires do not and retain their later render order. Colour and alpha are per instance, so attention fades unrelated facts without changing their identities.

The owner's [October 24 resistance request](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-24.1.record.md#turn-11) supplies the projected round-capped wire shader. Each endpoint's depth controls its resistance-adjusted width; near/far clipping and end-on caps agree with [the sizing math](forceGraphSizing.ts.mdmd.md). Wire transforms store their actual endpoints directly, without cylinder rotation or per-wire geometry. Spheres receive the same display-radius compensation used by labels and picking; citation arrows retain their physical length and end at the target's physical surface. Neither display resistance changes the force model's sizes.

Picking reads uploaded matrices. A sphere query rejects nonintersecting bounding spheres, then intersects the actual tessellated geometry through one reusable mesh. A wire query rejects points outside its cached projected stroke bounds, then checks the clipped, tapered stroke. These bindings form the renderer's picking index; browser observations read that same index and the actual GPU attributes, with separate pixel tests for the shader.

The draw guard compares explicit picture/appearance revisions with the camera, projection, canvas and background. Camera values are compared at Float32 upload precision against the last draw, while revision counters retain full precision. Same-size canvas assignments and restored WebGL contexts invalidate the picture. A partial physics evaluation that has not changed positions does not cause a new draw. The view's reveal advances only after the preceding membership has reached the screen.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SpatialDrawLink` {#symbol-spatialdrawlink}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphBatches.ts#L9)

##### `SpatialDrawLink` — Summary
The endpoints already resolved by the graph feed.

#### `SpatialDrawEntry` {#symbol-spatialdrawentry}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphBatches.ts#L12)

##### `SpatialDrawEntry` — Summary
A stable datum-to-buffer binding for picking; its slot follows the uploaded depth order.

#### `SpatialDrawBatch` {#symbol-spatialdrawbatch}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphBatches.ts#L20)

##### `SpatialDrawBatch` — Summary
Geometry shares a GPU batch; numeric working arrays keep preparation independent of graph-object shapes.

#### `SpatialDrawStyle` {#symbol-spatialdrawstyle}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphBatches.ts#L35)

##### `SpatialDrawStyle` — Summary
Values with visual meaning, supplied by the view without involving the force model.

#### `createSpatialBuffers` {#symbol-createspatialbuffers}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphBatches.ts#L45)
- Parameters: `scene`: [`Scene`](./localView/branch-scene.ts.mdmd.md#symbol-scene); `style`: [`SpatialDrawStyle`](#symbol-spatialdrawstyle)
- Constraints: [`SpatialNode`](./forceGraphLayout.ts.mdmd.md#symbol-spatialnode), [`SpatialDrawLink`](#symbol-spatialdrawlink)

##### `createSpatialBuffers` — Summary
Pack documented nodes and wires straight into three instance buffers; camera changes never build scene proxies.

#### `drawSpatialGraphOnChange` {#symbol-drawspatialgraphonchange}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphBatches.ts#L268)
- Parameters: `camera`: [`Camera`](./worldMap/projection.ts.mdmd.md#symbol-camera); `renderer`: `WebGLRenderer`

##### `drawSpatialGraphOnChange` — Summary
Draw when the camera or the caller's picture revision changes, leaving stationary scenes out of the frame loop.

#### `screenWireIntersectsFrustum` {#symbol-screenwireintersectsfrustum}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphBatches.ts#L298)
- Parameters: `clipMatrix`: `Matrix4`; `viewport`: `Vector2`

##### `screenWireIntersectsFrustum` — Summary
Clip a unit wire's axis in homogeneous coordinates, allowing its CSS-pixel half width and round caps.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`forceGraphLayout.SpatialNode`](./forceGraphLayout.ts.mdmd.md#symbol-spatialnode) (type-only)
- [`forceGraphSizing.clipSpatialWireDepth`](./forceGraphSizing.ts.mdmd.md#symbol-clipspatialwiredepth)
- [`forceGraphSizing.pickSpatialWire`](./forceGraphSizing.ts.mdmd.md#symbol-pickspatialwire)
- `three` - `BufferGeometry`, `Camera`, `Color`, `ConeGeometry`, `DynamicDrawUsage`, `Frustum`, `InstancedBufferAttribute`, `InstancedMesh`, `Intersection`, `Material`, `Matrix4`, `Mesh`, `MeshLambertMaterial`, `Quaternion`, `Raycaster`, `Scene`, `Sphere`, `SphereGeometry`, `Vector2`, `Vector3`, `Vector4`, `WebGLRenderer`
- `three/addons/lines/LineMaterial.js` - `LineMaterial`
- `three/addons/lines/LineSegmentsGeometry.js` - `LineSegmentsGeometry`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
