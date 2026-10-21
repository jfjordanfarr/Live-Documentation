# packages/explorer/src/client/views/forceGraphView.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/forceGraphView.ts
- Generated At: 2026-10-21T20:42:24.689Z

## Authored
### Purpose
Renders the force-directed 3D Local Map in either of its layouts, the analyzed connections or the declared structure, with shared retained selections, historical snapshots and the Related Documentation overlay. Owns the spheres, camera and projected controls; delegates inspection, retention and navigation to the application.

### Notes
- Wheel motion changes the camera only. Switching to the Local Map is an explicit application action.
- Created 2026-02-20 during the Explorer monolith refactor (1763 to 941 lines) that extracted this view alongside `download.ts`.
- Exposes rendering, activation, explicit file/directory framing and subject-anchor operations through its factory. The caller pauses the hidden view and cancels its pending gesture; resize observation keeps the canvas aligned with its actual container. The shell makes inactive view surfaces inert, so their projected buttons cannot take keyboard focus.
- Following the selected subject preserves simulation node objects, approaches the file from the existing viewing direction and follows it while the layout settles. The explicit framing APIs also let the retained-item tray bring a file or directory into view without making it the selected subject. A drag or wheel gesture gives camera control back to the person. Repeated rendering with unchanged membership and tuning does not restart the simulation.
- A sphere body or its projected focus label inspects the file or directory without changing the selected subject, pins or camera. Live camera tracking runs in the simulation tick before paint. A click acts on the sphere its press began on, even when a settling layout has carried that sphere a little way under a still pointer; picking intersects the actual objects retained through the library’s public position callback, avoiding its throttled hover cache.
- The visible action strip offers named icon buttons for Pin/Unpin, Centre and More for files, and Open or Close, by the directory's state as its 2D label offers them, Centre and More for directory hubs. Its glyphs match the compact 2D controls; accessible names, titles and Pin's pressed state carry the current action without replacing the focused button. Only a whole-file `*` pin shows Unpin; a file retained by individual symbols still offers Pin to retain every interface. The application owns these operations, including the same directory Centre action used by the reader and context menu.
- The strip follows the hovered or inspected sphere's screen projection and stays inside the viewport. It keeps its target and position while the pointer or keyboard focus is inside the controls, or their context menu is open, so a settling sphere cannot pull a button away. The menu's explicit close callback releases that target after restoring focus; an older menu cannot clear a newer target. A short hover-exit grace lets the pointer cross the gap to the strip; otherwise off-screen targets and active drags hide it. Inspection changes are read during the existing animation loop without feeding the graph or steering the camera.
- More, a stationary primary hold, right-click release, or Context Menu/Shift+F10 on the focus label or controls opens the shared commands. A hold consumes the later inspection click. Node drag, camera movement, additional pointers, wheel input, cancellation, lost pointer capture, Escape, window blur and view deactivation cancel a pending hold. Right-click waits for release so right-drag remains available to the native camera controls. Centre/Open are the visible navigation actions; no double-click shortcut is required.
- The application owns one pointer target, picked from the rendered spheres in its existing animation loop. Pointer changes, simulation ticks, camera/projection changes, canvas movement, resizing and rendering request a new pick; an unchanged picture needs none. Picking stops while hidden, dragging or without a pointer. The library keeps its tooltip and drag mechanics, but its hover callback does not write application attention: its two object caches do not reset on viewport exit and can miss same-object re-entry, while mixing those callbacks with a synthetic entry target can leave a target the library never observed.
- When the pointer leaves a sphere or the viewport, attention returns to the explicit menu target or the deliberate keyboard target identified by `:focus-visible`, otherwise to the retained scope. Keyboard focus establishes its target's preview; focus left behind by a mouse click only keeps the controls reachable. This distinction lets moving away after the last Unpin restore the full graph without a second click, and lets a temporary pointer peek return to the actual keyboard target. Touch release and cancellation clear pointer ownership rather than inventing hover after a finger lifts. Leaving keyboard focus schedules release as well.
- Shared pins, opened directories and paths fade unrelated nodes and connections. Hover temporarily reveals the inspected file's incident connections, including outside the retained scope; leaving the viewport restores current retained attention. Perspective changes keep the subject’s screen anchor while preserving the current viewing direction.
- Depends on the external `3d-force-graph` library.

The separation of inspection from direct Pin controls follows the owner's [October 19 choice](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-19.1.record.md#turn-24), resumed [October 20](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md#turn-2): following connections should stay quick while preserving the place under the person's eye, and held gestures must yield to dragging.

In the structure layout (2026-10-14) the amber directory hubs and their containment links are the picture: only the links of the chosen layout make springs, so a reference pulls nothing there, and a hub new to the picture starts at the centroid of its members that already have positions while the files keep theirs, so the motion folds the network into the tree from where the eye left it, without repeating the first picture's hidden warmup. Containment is always drawn; a reference is drawn on demand, for the hovered file, within and out of the hovered hub's subtree, among the retained files and along a path. A hub's hover label counts visible files; its explicit Open action retains the directory through the application and frames its actual members about their own center, and the pin tray can release that retention in either representation. Directory camera anchoring belongs to this renderer so a preset change cannot accidentally substitute the last selected file for the focused directory. The hubs were first built inside the connectivity layout for [the October 14 request](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-11--pin-management-approved-ancestor-disclosure-and-directory-hubs); the owner moved them to a layout of their own [the same day](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-14.1.record.md#turn-4).

The native accessor setters can rebuild geometries and materials even when a newly supplied function returns the same values. Appearance therefore updates only when effective attention, the path or the layout changes; sphere geometry updates only when its size settings change. Force-only tuning builds the field again and unfolds the picture at full strength, without rebuilding an unchanged appearance.

The shared spatial projection supplies counted file pairs and optional related documents. Sphere volume encodes public-symbol count plus a baseline unit, and a hub's the sum of its members'; preferred link gaps encode documented coupling with diminishing returns and collision clearance. Packing changes move existing positions while keeping the selected screen anchor; unchanged settings move nothing. Hover labels expose counts. The graph reports its motion with aria-busy, and the renderer’s actual spheres supply perspective-transition sizes. The engine runs until the motion finds the spheres still and stops it by raising the library's minimum alpha past any alpha, so aria-busy falls when the picture is still; the library's fifteen-second cooldown is no ceiling, so a slow renderer shows the still picture later rather than an unsettled one as the result. From 2026-10-16 to 2026-10-21 the engine stopped at D3's own minimum alpha, 0.001, some three hundred ticks after a reheat; before that, no minimum was set and it ran out the fifteen seconds after every change. The link opacity is 1, so that the alphas the link colours carry are the ones drawn; the library's default of 0.2 had multiplied them five-fold until the same day, a revealed reference at 0.1 and containment at 0.07. An asset's sphere has its own colour rather than the fallback grey. This supports [the shared-preset design](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-6--shared-presets-and-advanced-tuning-approved-for-implementation).

One update path for every membership change (2026-10-18, ticket C2 of [the change-over-time plan](../../../../../../../.mdmd/layer-3/change-over-time.mdmd.md#open-questions)): a pin that brings a filtered file in, a filter toggled, a layout switched and a step of history all pass through `render`, which carries the picture and eases it at the update energy. The node objects are kept by id, as before, and since this day the link objects by pair too, so that the library's data join, which binds a line's object to its datum, keeps the line across a change; before, every render handed it new link objects and it rebuilt every line, 65 to 88 ms a step with 2,650 links in [the probe of 2026-10-16](../../../../../../../AI-Agent-Workspace/Probes/2026-10-16/change-over-time/README.md), its third defect. A sphere that was in the picture keeps its place and a new one starts beside what holds it by `placeNewSpheres`, which generalizes the hub-at-centroid rule of 2026-10-14 to born files. The feed hands the library the data and `move` begins the motion at the update energy, held where the spheres stand, or unfolding afresh for a new layout, and says busy only when there will be ticks; at zero the engine is stopped before its first tick by an alpha minimum nothing is below. Only the first picture warms up, a hundred ticks unseen. The lever governs changes to what is shown: a change of the forces (a slider, a preset, which changes the equilibrium itself) unfolds the picture at full strength, and a hand moves it at full strength whatever the last change was fed, held where the spheres stood when the hand took hold and again where they stand when it lets go; the energy slider itself is left out of the settings that move the picture, so moving it stirs nothing. Opening a directory in 3D changes attention and the camera and not the membership, so it feeds nothing. Since 2026-10-21 one force does all the moving, `motionForce` of [the layout module](forceGraphLayout.ts.mdmd.md), with the library's charge and centring removed and its link force kept at strength zero so that every line's ends resolve; each sphere is tethered to where it stood when the motion began, the owner's choice of that day ([Turn 5](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-21.1.record.md#turn-5)). Before, the feed set the share of alpha D3's forces saw and the alpha the engine stopped at.

A moment of the history in place of today (2026-10-18, ticket C4 of [the change-over-time plan](../../../../../../../.mdmd/layer-3/change-over-time.mdmd.md#open-questions)): `setMoment` hands the view a moment's snapshot as the data, with the renames from the moment shown before and the energy to feed the change at; `render` re-keys the cached nodes, links, objects and the hovered, focused and action-target ids through those renames first (`rekey.ts`), so that a renamed file or hub keeps its sphere, its lines and its place under its new id, then reads today's pins, subject, inspection, path and open directories where they stand at the moment, retaining nothing for a pin that does not stand there, and draws the related documents the moment's files linked to then, which the history carries since 2026-10-20 (before, a moment drew none); a document today's bundle lacks says so in its label and opens nothing. Inspection and explicit actions on a past sphere resolve to the file or directory as it stands today; a file gone since has no current action, and a directory acts only while today's graph contains a file beneath it. This opens today's evidence rather than implying the bundle contains that past day's full docs. `settle` eases the standing picture at the tuning's energy after a thumb's drag placed it at zero. The focus label is put away when a panel or control stands over its point, so the step panel and the scrubber never have its words on theirs. `data-history-step` on the container says which step is shown, empty for today, for the specs.

A kept link's ends are set to the live node objects for its ids on every render (2026-10-18), since D3 keeps an end once resolved to an object and a rename or a death can leave that object behind in the cache: the lines to such objects led nowhere after a play through this repository's history ([Turn 8](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-17.1.record.md#turn-8)); and a past moment's `symbolCount` is cleared from a node when today's payload names its symbols instead. Held, with the re-keying's rule, by the scrubber spec's walk over a rename onto a dead file's path.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ForceGraphLink` {#symbol-forcegraphlink}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphView.ts#L61)

##### `ForceGraphLink` — Summary
A link in the Force Graph between two nodes.

#### `ForceGraphNode` {#symbol-forcegraphnode}
- Type: type
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphView.ts#L69)
- Returns: [`SpatialGraphNode`](./forceGraphData.ts.mdmd.md#symbol-spatialgraphnode)

##### `ForceGraphNode` — Summary
A node in the Force Graph, extending the payload with optional archetype.

#### `ForceGraphData` {#symbol-forcegraphdata}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphView.ts#L78)

##### `ForceGraphData` — Summary
Complete data structure for the Force Graph view.

#### `ForceGraphViewOptions` {#symbol-forcegraphviewoptions}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphView.ts#L89)

##### `ForceGraphViewOptions` — Summary
Options passed to the Force Graph view factory.

#### `ForceGraphViewApi` {#symbol-forcegraphviewapi}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphView.ts#L113)

##### `ForceGraphViewApi` — Summary
Public API surface of the Force Graph view.

#### `createForceGraphView` {#symbol-createforcegraphview}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphView.ts#L134)
- Returns: [`ForceGraphViewApi`](#symbol-forcegraphviewapi)
- Parameters: `options`: [`ForceGraphViewOptions`](#symbol-forcegraphviewoptions)

##### `createForceGraphView` — Summary
Creates the Force Graph (3D) view for the Live Docs Explorer.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `3d-force-graph` - `ForceGraph3D`, `ForceGraph3DInstance`
- `d3-force-3d` - `ForceLink` (type-only)
- [`dom.requireElement`](../dom.ts.mdmd.md#symbol-requireelement)
- [`moment.HistoryMoment`](../history/moment.ts.mdmd.md#symbol-historymoment) (type-only)
- [`rekey.NO_RENAMES`](../history/rekey.ts.mdmd.md#symbol-no_renames)
- [`rekey.Renames`](../history/rekey.ts.mdmd.md#symbol-renames)
- [`rekey.composedRenames`](../history/rekey.ts.mdmd.md#symbol-composedrenames)
- [`rekey.hasRenames`](../history/rekey.ts.mdmd.md#symbol-hasrenames)
- [`rekey.rekeyedCaches`](../history/rekey.ts.mdmd.md#symbol-rekeyedcaches)
- [`rekey.renamedId`](../history/rekey.ts.mdmd.md#symbol-renamedid)
- [`layout-presets.layoutPresetOf`](../layout-presets.ts.mdmd.md#symbol-layoutpresetof)
- [`icon-button.CENTRE_ICON`](../panels/icon-button.ts.mdmd.md#symbol-centre_icon)
- [`icon-button.DIRECTORY_ICON`](../panels/icon-button.ts.mdmd.md#symbol-directory_icon)
- [`icon-button.MORE_ICON`](../panels/icon-button.ts.mdmd.md#symbol-more_icon)
- [`icon-button.PIN_ICON`](../panels/icon-button.ts.mdmd.md#symbol-pin_icon)
- [`icon-button.iconButton`](../panels/icon-button.ts.mdmd.md#symbol-iconbutton)
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
- [`forceGraphLayout.MotionForce`](./forceGraphLayout.ts.mdmd.md#symbol-motionforce-interface)
- [`forceGraphLayout.MotionStart`](./forceGraphLayout.ts.mdmd.md#symbol-motionstart)
- [`forceGraphLayout.motionForce`](./forceGraphLayout.ts.mdmd.md#symbol-motionforce-function)
- [`forceGraphLayout.placeNewSpheres`](./forceGraphLayout.ts.mdmd.md#symbol-placenewspheres)
- [`forceGraphLayout.spatialNodeRadius`](./forceGraphLayout.ts.mdmd.md#symbol-spatialnoderadius)
- [`forceGraphLayout.spatialNodeValue`](./forceGraphLayout.ts.mdmd.md#symbol-spatialnodevalue)
- [`forceGraphLayout.symbolCountOf`](./forceGraphLayout.ts.mdmd.md#symbol-symbolcountof)
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
