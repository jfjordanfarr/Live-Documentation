# packages/explorer/src/client/views/forceGraphRenderer.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/forceGraphRenderer.ts
- Generated At: 2026-11-06T02:11:47.571Z

## Authored
### Purpose
Owns the 3D Local Map's Three.js scene, GPU drawing, camera controls and instance picking. Receives graph data and appearance from the view while leaving physical motion, attention, labels and application actions with their existing owners.

### Notes
Introduced for the owner's [October 29 direct-renderer trial](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/Summarized/2026-10-29.1.SUMMARIZED.md#turn-10). The earlier 3d-force-graph integration generated a scene object for every node and wire and then reassembled those objects into GPU batches. [T3 profiling](../../../../../../../AI-Agent-Workspace/Probes/2026-10-29/t3-freeze/README.md#the-first-repair-did-not-resolve-usability) showed substantial CPU preparation and repeated idle work despite fast GPU draws. This layer replaces that object round trip with [direct buffers](forceGraphBatches.ts.mdmd.md); Three and its trackball controls remain.

The scene has three geometry batches and two lights. Membership and appearance changes are queued for the next actual draw, so the uploaded instance index remains coherent for picking until that draw. The shared redraw guard handles camera changes, explicit revisions, resize and context restoration. The view drives both motion and the render loop; this renderer has no cooling schedule, simulation timer or authority to discard graph elements.

Node presses use the uploaded tessellated sphere. A node drag uses a camera-facing plane and pointer capture, temporarily fixes that node's coordinates, and restores its previous fixed-coordinate state on release or cancellation. Drag callbacks let the view cancel held actions and apply its established easing. Ordinary background gestures remain Three's trackball gestures; wheel handling remains with the view's subject-preserving camera logic. Wire hover displays the relationship label through the clipped projected stroke, without a second full-scene hover engine.

The node/line colour, visibility, radius and width accessors describe appearance only. Camera positions and graph-to-screen coordinates are shared with labels, framing and perspective transitions. The window into the graph remains the same documented data; this layer adds no source-analysis facts.

Since 2026-11-05 `nodeAt` returns a wrapped group's seed when the ray meets the group's wrapper before any sphere, so that hover, click, the press-and-hold menu and drag treat a wrapper as its seed; `wrappers` and `wrapperStyle` pass the [Group Wrappers experiment](../../../../../../../.mdmd/layer-3/live-documentation-explorer.mdmd.md#competing-layout-preferences)'s geometry and style to the buffers.

Since 2026-11-05 `wrappers` takes the place of a wrapper whose node has left the picture, so that a popped directory shell bursts where it stood.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SPATIAL_DRAG_SLOP` {#symbol-spatial_drag_slop}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphRenderer.ts#L10)

##### `SPATIAL_DRAG_SLOP` — Summary
Mouse/touch motion within this CSS-pixel distance is still a click, shared with the view's press/hold handling.

#### `SpatialRendererOptions` {#symbol-spatialrendereroptions}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphRenderer.ts#L13)

##### `SpatialRendererOptions` — Summary
The view owns motion and attention; this layer owns only their picture, camera and direct instance picking.

#### `SpatialRenderer` {#symbol-spatialrenderer}
- Type: class
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphRenderer.ts#L22)
- Constraints: [`SpatialNode`](./forceGraphLayout.ts.mdmd.md#symbol-spatialnode), [`SpatialDrawLink`](./forceGraphBatches.ts.mdmd.md#symbol-spatialdrawlink)

##### `SpatialRenderer` — Summary
A direct Three renderer with a bounded number of scene objects, irrespective of graph size.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`forceGraphBatches.SpatialDrawLink`](./forceGraphBatches.ts.mdmd.md#symbol-spatialdrawlink)
- [`forceGraphBatches.SpatialDrawStyle`](./forceGraphBatches.ts.mdmd.md#symbol-spatialdrawstyle)
- [`forceGraphBatches.SpatialWrapperStyle`](./forceGraphBatches.ts.mdmd.md#symbol-spatialwrapperstyle)
- [`forceGraphBatches.createSpatialBuffers`](./forceGraphBatches.ts.mdmd.md#symbol-createspatialbuffers)
- [`forceGraphBatches.drawSpatialGraphOnChange`](./forceGraphBatches.ts.mdmd.md#symbol-drawspatialgraphonchange)
- [`forceGraphCamera.CameraPoint`](./forceGraphCamera.ts.mdmd.md#symbol-camerapoint) (type-only)
- [`forceGraphLayout.Placed`](./forceGraphLayout.ts.mdmd.md#symbol-placed) (type-only)
- [`forceGraphLayout.SpatialNode`](./forceGraphLayout.ts.mdmd.md#symbol-spatialnode) (type-only)
- [`forceGraphWrappers.GroupWrappers`](./forceGraphWrappers.ts.mdmd.md#symbol-groupwrappers) (type-only)
- [`forceGraphWrappers.WrapperHull`](./forceGraphWrappers.ts.mdmd.md#symbol-wrapperhull-interface) (type-only)
- `three` - `AmbientLight`, `DirectionalLight`, `PerspectiveCamera`, `Plane`, `Raycaster`, `Scene`, `Vector2`, `Vector3`, `WebGLRenderer`
- `three/addons/controls/TrackballControls.js` - `TrackballControls`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../../../../layer-3/architectural-decisions.mdmd.md)
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
