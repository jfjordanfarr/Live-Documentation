# packages/explorer/src/client/views/forceGraphView.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/forceGraphView.ts
- Generated At: 2026-10-18T05:36:02.613Z

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

The shared spatial projection supplies counted file pairs and optional related documents. Sphere volume encodes public-symbol count plus a baseline unit, and a hub's the sum of its members'; preferred link gaps encode documented coupling with diminishing returns and collision clearance. Packing changes reheat existing positions while keeping the selected screen anchor; unchanged settings do not reheat. Hover labels expose counts. The graph reports its simulation activity with aria-busy, and the renderer’s actual spheres supply perspective-transition sizes. The engine stops at D3's own minimum alpha, 0.001, some three hundred ticks after a reheat, so aria-busy falls when the layout has settled; until 2026-10-16 no minimum was set and the engine ran out the library's fifteen-second cooldown after every change, and since 2026-10-18 that fifteen seconds is no ceiling either, so a slow renderer shows the settled picture later rather than an unsettled one as the result. The link opacity is 1, so that the alphas the link colours carry are the ones drawn; the library's default of 0.2 had multiplied them five-fold until the same day, a revealed reference at 0.1 and containment at 0.07. An asset's sphere has its own colour rather than the fallback grey. This supports [the shared-preset design](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-6--shared-presets-and-advanced-tuning-approved-for-implementation).

One update path for every membership change (2026-10-18, ticket C2 of [the change-over-time plan](../../../../../../../.mdmd/layer-3/change-over-time.mdmd.md#open-questions)): a pin that brings a filtered file in, a filter toggled, a layout switched, and later a step of history all pass through `render`, which carries the picture and feeds the simulation by the update energy. The node objects are kept by id, as before, and since this day the link objects by pair too, so that the library's data join, which binds a line's object to its datum, keeps the line across a change; before, every render handed it new link objects and it rebuilt every line, 65 to 88 ms a step with 2,650 links in [the probe of 2026-10-16](../../../../../../../AI-Agent-Workspace/Probes/2026-10-16/change-over-time/README.md), its third defect. A sphere that was in the picture keeps its place and a new one starts beside what holds it by `placeNewSpheres`, which generalizes the hub-at-centroid rule of 2026-10-14 to born files. The feed sets the share of alpha the forces see and the alpha the engine stops at from `updateSchedule`, hands the library the data, and says busy only when there will be ticks; at placement alone the engine is stopped before its first tick by an alpha minimum nothing is below. Only the first picture warms up. The lever governs changes to what is shown: a change of the forces (a slider, a preset, which changes the equilibrium itself) reheats fully as before, and a sphere dragged by hand acclimates the picture with all of alpha, the library's own reheat, whatever the last change was fed; the energy slider itself is left out of the settings that reheat, so moving it stirs nothing. Opening a directory in 3D changes attention and the camera and not the membership, so it feeds nothing. Nothing is held or pinned in place: the forces hold the picture (C5).

A moment of the history in place of today (2026-10-18, ticket C4 of [the change-over-time plan](../../../../../../../.mdmd/layer-3/change-over-time.mdmd.md#open-questions)): `setMoment` hands the view a moment's snapshot as the data, with the renames from the moment shown before and the energy to feed the change at; `render` re-keys the cached nodes, links, objects and the hovered and focused ids through those renames first (`rekey.ts`), so that a renamed file or hub keeps its sphere, its lines and its place under its new id, then reads today's pins, subject, path and open directories where they stand at the moment, retaining nothing for a pin that does not stand there, and draws no related documentation, since the docs of that day are not in the bundle. A click on a sphere of the past reaches the file or directory as it stands today. `settle` feeds the standing picture at the tuning's energy after a drag placed it at zero. The focus label is put away when a panel or control stands over its point, so the step panel and the scrubber never have its words on theirs. `data-history-step` on the container says which step is shown, empty for today, for the specs.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ForceGraphLink` {#symbol-forcegraphlink}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphView.ts#L59)

##### `ForceGraphLink` — Summary
A link in the Force Graph between two nodes.

#### `ForceGraphNode` {#symbol-forcegraphnode}
- Type: type
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphView.ts#L67)
- Returns: [`SpatialGraphNode`](./forceGraphData.ts.mdmd.md#symbol-spatialgraphnode)

##### `ForceGraphNode` — Summary
A node in the Force Graph, extending the payload with optional archetype.

#### `ForceGraphData` {#symbol-forcegraphdata}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphView.ts#L76)

##### `ForceGraphData` — Summary
Complete data structure for the Force Graph view.

#### `ForceGraphViewOptions` {#symbol-forcegraphviewoptions}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphView.ts#L87)

##### `ForceGraphViewOptions` — Summary
Options passed to the Force Graph view factory.

#### `ForceGraphViewApi` {#symbol-forcegraphviewapi}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphView.ts#L101)

##### `ForceGraphViewApi` — Summary
Public API surface of the Force Graph view.

#### `createForceGraphView` {#symbol-createforcegraphview}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphView.ts#L120)
- Returns: [`ForceGraphViewApi`](#symbol-forcegraphviewapi)
- Parameters: `options`: [`ForceGraphViewOptions`](#symbol-forcegraphviewoptions)

##### `createForceGraphView` — Summary
Creates the Force Graph (3D) view for the Live Docs Explorer.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `3d-force-graph` - `ForceGraph3D`, `ForceGraph3DInstance`
- [`dom.requireElement`](../dom.ts.mdmd.md#symbol-requireelement)
- [`moment.HistoryMoment`](../history/moment.ts.mdmd.md#symbol-historymoment) (type-only)
- [`rekey.NO_RENAMES`](../history/rekey.ts.mdmd.md#symbol-no_renames)
- [`rekey.Renames`](../history/rekey.ts.mdmd.md#symbol-renames)
- [`rekey.composedRenames`](../history/rekey.ts.mdmd.md#symbol-composedrenames)
- [`rekey.hasRenames`](../history/rekey.ts.mdmd.md#symbol-hasrenames)
- [`rekey.rekeyedCaches`](../history/rekey.ts.mdmd.md#symbol-rekeyedcaches)
- [`rekey.renamedId`](../history/rekey.ts.mdmd.md#symbol-renamedid)
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
- [`forceGraphLayout.SETTLED_ALPHA`](./forceGraphLayout.ts.mdmd.md#symbol-settled_alpha)
- [`forceGraphLayout.configureSpatialForces`](./forceGraphLayout.ts.mdmd.md#symbol-configurespatialforces)
- [`forceGraphLayout.placeNewSpheres`](./forceGraphLayout.ts.mdmd.md#symbol-placenewspheres)
- [`forceGraphLayout.spatialNodeRadius`](./forceGraphLayout.ts.mdmd.md#symbol-spatialnoderadius)
- [`forceGraphLayout.spatialNodeValue`](./forceGraphLayout.ts.mdmd.md#symbol-spatialnodevalue)
- [`forceGraphLayout.symbolCountOf`](./forceGraphLayout.ts.mdmd.md#symbol-symbolcountof)
- [`forceGraphLayout.updateSchedule`](./forceGraphLayout.ts.mdmd.md#symbol-updateschedule-function)
- [`directory-state.under`](./localView/directory-state.ts.mdmd.md#symbol-under)
- [`perspectiveTransition.ForceScene`](./perspectiveTransition.ts.mdmd.md#symbol-forcescene) (type-only)
- [`pin-state.EMPTY_PIN_SET`](./pin-state.ts.mdmd.md#symbol-empty_pin_set)
- [`pin-state.PinSet`](./pin-state.ts.mdmd.md#symbol-pinset)
- [`pin-state.getVisibleConnections`](./pin-state.ts.mdmd.md#symbol-getvisibleconnections)
- [`wheel.wheelPixels`](./wheel.ts.mdmd.md#symbol-wheelpixels)
- [`staticExplorerData.RelatedDocLink`](../../shared/staticExplorerData.ts.mdmd.md#symbol-relateddoclink) (type-only)
- [`types.ExplorerGraphPayload`](../../shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`types.ExplorerLinkPayload`](../../shared/types.ts.mdmd.md#symbol-explorerlinkpayload) (type-only)
- [`types.ExplorerNodePayload`](../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
- `three` - `Box3`, `Object3D`, `PerspectiveCamera`, `Raycaster`, `Vector2`, `Vector3`
<!-- LIVE-DOC:END Dependencies -->
