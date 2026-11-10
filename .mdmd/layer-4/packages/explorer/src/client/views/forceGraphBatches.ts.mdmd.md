# packages/explorer/src/client/views/forceGraphBatches.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/forceGraphBatches.ts
- Generated At: 2026-11-10T16:20:12.318Z

## Authored
### Purpose
Packs the 3D Local Map's nodes, projected wires and citation arrows directly into shared GPU instance buffers. Keeps stable picking identities, physical radii, colour/alpha, transparent depth order and independent node/wire zoom resistance without a scene object per graph element.

### Notes
Created in the [October 23 identity/framing pass](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-23.1.record.md#turn-5), when wider framing exposed a drawing bottleneck: the same graph settled by 15.3 seconds in the previous close-up and 36.4 seconds in the wider view. The first implementation batched native scene meshes while retaining them as placement/picking proxies. That representation still spent hundreds of milliseconds rebuilding batches for T3. The owner approved direct batches in [October 29, Turn 10](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/Summarized/2026-10-29.1.SUMMARIZED.md#turn-10), after [CPU/GPU measurements](../../../../../../../AI-Agent-Workspace/Probes/2026-10-29/t3-freeze/README.md#the-first-repair-did-not-resolve-usability) separated that preparation cost from drawing itself.

Mutable layout positions are read once per draw into packed numeric arrays. Wires bind to numeric endpoint indices when membership changes; projection, cached appearance, bounds and depth sorting then use contiguous numeric inputs rather than repeated reads through graph objects. Projection is shared at node endpoints, including across every incident wire. Exact double-precision depth sorting starts from the preceding order, with creation order for ties; attributes are written directly into their new slots. Stable datum bindings still identify uploaded slots for picking. These reduce CPU preparation without changing the visible set or making subpixel elements unpickable.

The scene holds one instanced mesh each for spheres, wires and arrows, and since 2026-11-02 one for the rings: one entry per sphere, enabled while the style gives it a colour, a flat unlit ring at the sphere's drawn radius, turned to the camera at every draw, sorted at the sphere's depth, drawn after the spheres and writing no depth, so that it cuts no wire; the view gives a ring to every sphere with connections the picture does not show, the owner's choice of that evening ([Turn 10 of the November 2 record](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-02.1.record.md#turn-10)). A datum owns a stable binding to a slot, retained across changes when the view retains that datum; the slot may change when depth order changes. Buffers grow geometrically and release old GPU attributes before replacing them; every batch has its instance attributes from creation, with room for one, since the renderer compiles a mesh's program on its first frame whatever its count and the wire shader reads the instance colour, which Three declares only for a mesh that has one: under discovery a first piece of one sphere has no wires, and the first frame failed to compile the wire program before this (found in the pictures of 2026-10-31). Invisible and culled members stay addressable after the drawn prefix, preserving the distinction between graph membership and what the camera sees. Sphere tessellation remains twelve segments. Since 2026-10-30 the wires are drawn first and write depth, a faded wire none, so that a faded sphere in front lets a wire show through and a faded wire cuts no hole in a bright one behind it; before, the spheres were drawn first and every sphere, faded or not, cut the wires behind it. Colour and alpha are per instance, so attention fades unrelated facts without changing their identities. A wire's colour is one RGB for its whole length: the blue-to-green run by direction of 2026-10-30 was withdrawn on 2026-10-31 at the owner's eye ([Turn 1 of the October 31 record](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-31.1.record.md#turn-1)), since in the whole web no wire's two ends could be told apart, and the hover's words carry the direction instead.

The owner's [October 24 resistance request](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-24.1.record.md#turn-11) supplies the projected round-capped wire shader. The camera target supplies one world-width compensation for the scene; each endpoint's depth then supplies ordinary perspective taper. Near/far clipping and end-on caps agree with [the sizing math](forceGraphSizing.ts.mdmd.md). Wire transforms store their actual endpoints directly, without cylinder rotation or per-wire geometry; since 2026-10-30 the endpoints are trimmed to the two spheres' drawn surfaces, so a wire neither pierces its own spheres nor is cut by them, and two spheres that touch have no wire drawn between them. Spheres receive the same display-radius compensation used by labels and picking; a citation arrow takes its target sphere's units under that compensation and stands at the drawn surface (2026-10-30; before, it kept its physical length and sank into a sphere drawn larger). Neither display resistance changes the force model's sizes.

Picking reads uploaded matrices. A sphere query rejects nonintersecting bounding spheres, then intersects the actual tessellated geometry through one reusable mesh. A wire query rejects points outside its cached projected stroke bounds, then checks the clipped, tapered stroke. These bindings form the renderer's picking index; browser observations read that same index and the actual GPU attributes, with separate pixel tests for the shader.

The draw guard compares explicit picture/appearance revisions with the camera, orbit target, projection, canvas and background. Camera values are compared at Float32 upload precision against the last draw, while revision counters retain full precision. Same-size canvas assignments and restored WebGL contexts invalidate the picture. A partial physics evaluation that has not changed positions does not cause a new draw. The view's reveal advances only after the preceding membership has reached the screen.

Since 2026-11-05 the buffers hold one more scene object, the mesh of every [wrapped group](../../../../../../../.mdmd/layer-3/live-documentation-explorer.mdmd.md#competing-layout-preferences), drawn after the rings with no depth writes, double-sided, its vertices written each draw from the seeds' places, farthest group first, by `mergeWrappers`. One shader gives the three looks by uniforms (Skin, Cloud, Cloud with a rim for the hovered group); it has no time in it, so a still picture still draws once. `pickWrapper` finds the nearest wrapper a ray meets, leaving out one bursting open, and `pickNodeHit` gives a sphere's hit distance so the renderer can tell which is in front. While the choice is off and nothing is drawn, the wrappers' update writes nothing.

Since 2026-11-06 the buffers hold two more scene objects, what the directory shells' skins show within them under the Skin look: a shell's own files as lit spheres in their colours, drawn with the spheres at the size a sphere draws but never past the room each keeps, and its subdirectories' balloons in the skin's own look (`wrapperShader`, instanced), drawn before the skins with no depth writes; a shell whose hull is not built yet is drawn as one balloon of its body in any look but Off. Their records (`spatialUnits`) and the skins' centres and radii (`ranges`) are kept on the meshes for the browser specs ([the evidence](../../../../../../../AI-Agent-Workspace/Screenshots/2026-11-06/shell-mesh/README.md)).

Since 2026-11-05 a style may say a node is not drawn as a sphere (`sphere`): a directory shell is drawn as its wrapper alone, its wires ending at its body's unresisted radius, and it is picked by its wrapper. `setWrappers` takes the place of a wrapper whose node has left the picture, a shell bursting after its pop.

Since the second round of 2026-11-06 the units are drawn for every wrapped body, a group's too, at its skin or, before its hull is built, at its node; an inner bubble is a faint rim and a veiled one a milky fill (`spatialVeil`), and each unit's record carries its bubble and depth ([the evidence](../../../../../../../AI-Agent-Workspace/Screenshots/2026-11-06/shell-leaves/README.md)).

Since November 8, 2026, the typed capture getter detaches selected skins and interior instances from the last uploaded picture. It reads real matrices, mesh geometry, colors and alpha, retains slot order and nesting, and keeps a pending hull as its actual fallback balloon. It does not consult diagnostic metadata or re-run packing, and a queued appearance edit cannot rewrite the captured drawing.

Since November 8, 2026 the contained-file batch selects its [per-sample sphere primitive](containedSphere.ts.mdmd.md) from the actual renderer before compilation. Unsupported sample capabilities, output encoding or tone mapping retain the native sphere. This changes neither submitted membership/order/alpha nor ordinary node meshes or picking. Frozen capture records the analytic sphere parameters rather than interpreting its bounding quad as the mark; native compatibility capture still records the submitted sphere mesh.

Native contained capture also records the submitted material's facing, so a clipped FrontSide fallback retains only its actual uploaded front surfaces.

Since the correction in [November 10, Turn 3](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-10.1.record.md#turn-3), `SPATIAL_RING_OUTER_RADIUS` names the ring geometry's outer edge in drawn-sphere units. Projected name placement reads that same constant, so its clearance includes the actual ring without a second renderer-specific radius.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SPATIAL_RING_OUTER_RADIUS` {#symbol-spatial_ring_outer_radius}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphBatches.ts#L12)

##### `SPATIAL_RING_OUTER_RADIUS` — Summary
The outer edge of a frontier ring, in its sphere's drawn-radius units.

#### `SpatialDrawLink` {#symbol-spatialdrawlink}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphBatches.ts#L15)

##### `SpatialDrawLink` — Summary
The endpoints already resolved by the graph feed.

#### `SpatialDrawEntry` {#symbol-spatialdrawentry}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphBatches.ts#L18)

##### `SpatialDrawEntry` — Summary
A stable datum-to-buffer binding for picking; its slot follows the uploaded depth order.

#### `SpatialDrawBatch` {#symbol-spatialdrawbatch}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphBatches.ts#L26)

##### `SpatialDrawBatch` — Summary
Geometry shares a GPU batch; numeric working arrays keep preparation independent of graph-object shapes.

#### `SpatialDrawStyle` {#symbol-spatialdrawstyle}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphBatches.ts#L41)

##### `SpatialDrawStyle` — Summary
Values with visual meaning, supplied by the view without involving the force model.

#### `SpatialWrapperStyle` {#symbol-spatialwrapperstyle}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphBatches.ts#L62)

##### `SpatialWrapperStyle` — Summary
How the wrapped groups are drawn this frame (2026-11-05): each wrapper's opacity, as its seed's, and the growth of one
bursting open; the seed under the pointer or keyboard focus, whose wrapper the cloud with a rim outlines; and the
seeds bursting open, drawn but no longer picked.

#### `SpatialWrapperUnit` {#symbol-spatialwrapperunit}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphBatches.ts#L74)

##### `SpatialWrapperUnit` — Summary
One unit a wrapper shows within its skin (2026-11-06), relative to its centre: a file, drawn as a sphere in its colour
at the size a sphere draws, never past the room it keeps, or a subdirectory's balloon, drawn at its body's size in the
skin's look.

#### `createSpatialBuffers` {#symbol-createspatialbuffers}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphBatches.ts#L91)
- Parameters: `scene`: `Scene`; `style`: [`SpatialDrawStyle`](#symbol-spatialdrawstyle); `renderer`: `WebGLRenderer`
- Constraints: [`SpatialNode`](./forceGraphLayout.ts.mdmd.md#symbol-spatialnode), [`SpatialDrawLink`](#symbol-spatialdrawlink)

##### `createSpatialBuffers` — Summary
Pack documented nodes and wires straight into three instance buffers; camera changes never build scene proxies.

#### `drawSpatialGraphOnChange` {#symbol-drawspatialgraphonchange}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphBatches.ts#L563)
- Parameters: `camera`: `Camera`; `renderer`: `WebGLRenderer`

##### `drawSpatialGraphOnChange` — Summary
Draw when the camera or the caller's picture revision changes, leaving stationary scenes out of the frame loop.

#### `screenWireIntersectsFrustum` {#symbol-screenwireintersectsfrustum}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphBatches.ts#L593)
- Parameters: `clipMatrix`: `Matrix4`; `viewport`: `Vector2`

##### `screenWireIntersectsFrustum` — Summary
Clip a unit wire's axis in homogeneous coordinates, projecting its compensated world width and round caps.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`containedSphere.ContainedSphereMaterial`](./containedSphere.ts.mdmd.md#symbol-containedspherematerial)
- [`containedSphere.containedSpherePrimitive`](./containedSphere.ts.mdmd.md#symbol-containedsphereprimitive)
- [`forceGraphLayout.Placed`](./forceGraphLayout.ts.mdmd.md#symbol-placed) (type-only)
- [`forceGraphLayout.SpatialNode`](./forceGraphLayout.ts.mdmd.md#symbol-spatialnode) (type-only)
- [`forceGraphSizing.clipSpatialWireDepth`](./forceGraphSizing.ts.mdmd.md#symbol-clipspatialwiredepth)
- [`forceGraphSizing.pickSpatialWire`](./forceGraphSizing.ts.mdmd.md#symbol-pickspatialwire)
- [`forceGraphSizing.spatialSizeScale`](./forceGraphSizing.ts.mdmd.md#symbol-spatialsizescale)
- [`forceGraphWrappers.GroupWrappers`](./forceGraphWrappers.ts.mdmd.md#symbol-groupwrappers)
- [`forceGraphWrappers.WrapperGeometry`](./forceGraphWrappers.ts.mdmd.md#symbol-wrappergeometry)
- [`forceGraphWrappers.WrapperHull`](./forceGraphWrappers.ts.mdmd.md#symbol-wrapperhull-interface)
- [`forceGraphWrappers.mergeWrappers`](./forceGraphWrappers.ts.mdmd.md#symbol-mergewrappers)
- [`forceGraphWrappers.wrapperAt`](./forceGraphWrappers.ts.mdmd.md#symbol-wrapperat)
- [`perspectiveBodies.FrozenBodyMesh`](./perspectiveBodies.ts.mdmd.md#symbol-frozenbodymesh) (type-only)
- [`perspectiveBodies.FrozenBodyUnit`](./perspectiveBodies.ts.mdmd.md#symbol-frozenbodyunit) (type-only)
- [`perspectiveBodies.FrozenSpatialBody`](./perspectiveBodies.ts.mdmd.md#symbol-frozenspatialbody) (type-only)
- `three` - `BufferAttribute`, `BufferGeometry`, `Camera`, `Color`, `ConeGeometry`, `DoubleSide`, `DynamicDrawUsage`, `FrontSide`, `Frustum`, `InstancedBufferAttribute`, `InstancedMesh`, `Intersection`, `Material`, `Matrix4`, `Mesh`, `MeshBasicMaterial`, `MeshLambertMaterial`, `Quaternion`, `Raycaster`, `RingGeometry`, `Scene`, `ShaderMaterial`, `Sphere`, `SphereGeometry`, `Vector2`, `Vector3`, `Vector4`, `WebGLRenderer`
- `three/addons/lines/LineMaterial.js` - `LineMaterial`
- `three/addons/lines/LineSegmentsGeometry.js` - `LineSegmentsGeometry`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
