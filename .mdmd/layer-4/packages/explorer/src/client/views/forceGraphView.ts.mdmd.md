# packages/explorer/src/client/views/forceGraphView.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/forceGraphView.ts
- Generated At: 2026-10-16T21:14:09.571Z

## Authored
### Purpose
Renders the force-directed 3D Local Map in either of its layouts, the analyzed connections or the declared structure, with its shared retained selections and the Related Documentation overlay.

### Notes
- Wheel motion changes the camera only. Switching to the Local Map is an explicit application action.
- Created 2026-02-20 during the Explorer monolith refactor (1763 to 941 lines) that extracted this view alongside `download.ts`.
- Exposes rendering, activation and subject-anchor operations through its factory. The caller pauses the hidden view; resize observation keeps the canvas aligned with its actual container.
- Selection preserves simulation node objects, approaches the selected file from the existing viewing direction and follows it while the layout settles. A drag or wheel gesture gives camera control back to the person. Repeated rendering with unchanged membership and tuning does not restart the simulation.
- The focus label follows the projected file and opens its documentation. Live camera tracking runs in the simulation tick before paint. Clicks intersect the actual node objects retained through the library’s public position callback, avoiding its throttled hover cache; selected source files use the Explorer’s normal selection and history path.
- Viewport entry uses the same direct node picking: the native hover cache can survive a viewport exit and remain silent when the pointer returns to the same sphere. Local attention must still recover after it was cleared on exit.
- Shared pins, opened directories and paths fade unrelated nodes and connections. Hover temporarily reveals the inspected file's incident connections, including outside the retained scope; leaving the viewport restores current retained attention. Perspective changes keep the subject’s screen anchor while preserving the current viewing direction.
- Depends on the external `3d-force-graph` library.

In the structure layout (2026-10-14) the amber directory hubs and their containment links are the picture: only the links of the chosen layout reach the spring force, so a reference pulls nothing there, and a hub new to the picture starts at the centroid of its members that already have positions while the files keep theirs, so the simulation folds the network into the tree from where the eye left it, without repeating the first picture's hidden warmup. Containment is always drawn; a reference is drawn on demand, for the hovered file, within and out of the hovered hub's subtree, among the retained files and along a path. A hub's hover label counts visible files; a click retains the directory through the shared controller and frames its actual members about their own center, and the pin tray can release that retention in either representation. Directory camera anchoring belongs to this renderer so a preset change cannot accidentally substitute the last selected file for the focused directory. The hubs were first built inside the connectivity layout for [the October 14 request](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-11--pin-management-approved-ancestor-disclosure-and-directory-hubs); the owner moved them to a layout of their own [the same day](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-14.1.record.md#turn-4).

The native accessor setters can rebuild geometries and materials even when a newly supplied function returns the same values. Appearance therefore updates only when effective attention, the path or the layout changes; sphere geometry updates only when its size settings change. Force-only tuning still reheats the simulation with the same mathematical configuration, without rebuilding an unchanged appearance.

The shared spatial projection supplies counted file pairs and optional related documents. Sphere volume encodes public-symbol count plus a baseline unit, and a hub's the sum of its members'; preferred link gaps encode documented coupling with diminishing returns and collision clearance. Packing changes reheat existing positions while keeping the selected screen anchor; unchanged settings do not reheat. Hover labels expose counts. The graph reports its simulation activity with aria-busy, and the renderer’s actual spheres supply perspective-transition sizes. The engine stops at D3's own minimum alpha, 0.001, some three hundred ticks after a reheat, so aria-busy falls when the layout has settled; until 2026-10-16 no minimum was set and the engine ran out the library's fifteen-second cooldown after every change. The link opacity is 1, so that the alphas the link colours carry are the ones drawn; the library's default of 0.2 had multiplied them five-fold until the same day, a revealed reference at 0.1 and containment at 0.07. An asset's sphere has its own colour rather than the fallback grey. This supports [the shared-preset design](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-6--shared-presets-and-advanced-tuning-approved-for-implementation).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ForceGraphLink` {#symbol-forcegraphlink}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphView.ts#L50)

##### `ForceGraphLink` — Summary
A link in the Force Graph between two nodes.

#### `ForceGraphNode` {#symbol-forcegraphnode}
- Type: type
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphView.ts#L58)
- Returns: [`SpatialGraphNode`](./forceGraphData.ts.mdmd.md#symbol-spatialgraphnode)

##### `ForceGraphNode` — Summary
A node in the Force Graph, extending the payload with optional archetype.

#### `ForceGraphData` {#symbol-forcegraphdata}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphView.ts#L67)

##### `ForceGraphData` — Summary
Complete data structure for the Force Graph view.

#### `ForceGraphViewOptions` {#symbol-forcegraphviewoptions}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphView.ts#L78)

##### `ForceGraphViewOptions` — Summary
Options passed to the Force Graph view factory.

#### `ForceGraphViewApi` {#symbol-forcegraphviewapi}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphView.ts#L92)

##### `ForceGraphViewApi` — Summary
Public API surface of the Force Graph view.

#### `createForceGraphView` {#symbol-createforcegraphview}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphView.ts#L103)
- Returns: [`ForceGraphViewApi`](#symbol-forcegraphviewapi)
- Parameters: `options`: [`ForceGraphViewOptions`](#symbol-forcegraphviewoptions)

##### `createForceGraphView` — Summary
Creates the Force Graph (3D) view for the Live Docs Explorer.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `3d-force-graph` - `ForceGraph3D`, `ForceGraph3DInstance`
- [`dom.requireElement`](../dom.ts.mdmd.md#symbol-requireelement)
- [`layout-presets.layoutPresetOf`](../layout-presets.ts.mdmd.md#symbol-layoutpresetof)
- [`types.ExplorerState`](../types.ts.mdmd.md#symbol-explorerstate) (type-only)
- [`forceGraphCamera.CameraPoint`](./forceGraphCamera.ts.mdmd.md#symbol-camerapoint)
- [`forceGraphCamera.focusedCameraPosition`](./forceGraphCamera.ts.mdmd.md#symbol-focusedcameraposition)
- [`forceGraphCamera.frameCameraSpheres`](./forceGraphCamera.ts.mdmd.md#symbol-framecameraspheres)
- [`forceGraphCamera.screenAnchorTranslation`](./forceGraphCamera.ts.mdmd.md#symbol-screenanchortranslation)
- [`forceGraphCamera.wheelZoomCamera`](./forceGraphCamera.ts.mdmd.md#symbol-wheelzoomcamera)
- [`forceGraphData.SpatialGraphNode`](./forceGraphData.ts.mdmd.md#symbol-spatialgraphnode)
- [`forceGraphData.SpatialLinkKind`](./forceGraphData.ts.mdmd.md#symbol-spatiallinkkind)
- [`forceGraphData.directoryNodeId`](./forceGraphData.ts.mdmd.md#symbol-directorynodeid)
- [`forceGraphData.spatialGraphOf`](./forceGraphData.ts.mdmd.md#symbol-spatialgraphof)
- [`forceGraphLayout.configureSpatialForces`](./forceGraphLayout.ts.mdmd.md#symbol-configurespatialforces)
- [`forceGraphLayout.spatialNodeRadius`](./forceGraphLayout.ts.mdmd.md#symbol-spatialnoderadius)
- [`forceGraphLayout.spatialNodeValue`](./forceGraphLayout.ts.mdmd.md#symbol-spatialnodevalue)
- [`directory-state.under`](./localView/directory-state.ts.mdmd.md#symbol-under)
- [`perspectiveTransition.ForceScene`](./perspectiveTransition.ts.mdmd.md#symbol-forcescene) (type-only)
- [`pin-state.EMPTY_PIN_SET`](./pin-state.ts.mdmd.md#symbol-empty_pin_set)
- [`pin-state.getVisibleConnections`](./pin-state.ts.mdmd.md#symbol-getvisibleconnections)
- [`wheel.wheelPixels`](./wheel.ts.mdmd.md#symbol-wheelpixels)
- [`staticExplorerData.RelatedDocLink`](../../shared/staticExplorerData.ts.mdmd.md#symbol-relateddoclink) (type-only)
- [`types.ExplorerGraphPayload`](../../shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`types.ExplorerLinkPayload`](../../shared/types.ts.mdmd.md#symbol-explorerlinkpayload) (type-only)
- [`types.ExplorerNodePayload`](../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
- `three` - `Box3`, `Object3D`, `PerspectiveCamera`, `Raycaster`, `Vector2`, `Vector3`
<!-- LIVE-DOC:END Dependencies -->
