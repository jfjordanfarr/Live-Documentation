# packages/explorer/src/client/views/forceGraphView.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/forceGraphView.ts
- Generated At: 2026-10-28T21:56:32.645Z

## Authored
### Purpose
Renders the force-directed 3D Local Map in either of its layouts, the analyzed connections or the declared structure, with shared retained selections, historical snapshots and the Related Documentation overlay. Owns the spheres, camera and projected controls; delegates inspection, retention and navigation to the application.

### Notes
- Wheel motion changes the camera only. Switching to the Local Map is an explicit application action.
- Created 2026-02-20 during the Explorer monolith refactor (1763 to 941 lines) that extracted this view alongside `download.ts`.
- Exposes rendering, activation, explicit file/directory framing and subject-anchor operations through its factory. The caller pauses the hidden view and cancels its pending gesture; resize observation keeps the canvas aligned with its actual container. The shell makes inactive view surfaces inert, so their projected buttons cannot take keyboard focus.
- Following the selected subject preserves simulation node objects, frames the file with its immediate connections from the existing viewing direction and follows that neighbourhood while the layout settles. Explicit Fit frames the current path, retained files/directories, the unpinned subject’s neighbourhood or the whole graph when there is no scope, without changing the exploration. The explicit framing APIs also let the retained-item tray bring a file or directory into view without making it the selected subject. A drag or wheel gesture gives camera control back to the person. Repeated rendering with unchanged membership and tuning does not restart the simulation.
- A sphere body or its projected name inspects the file or directory without changing the selected subject, pins or camera. Live camera tracking runs in the simulation tick before paint. A click acts on the sphere its press began on, even when a settling layout has carried that sphere a little way under a still pointer; picking intersects the actual objects retained through the library’s public position callback, avoiding its throttled hover cache.
- The visible action strip offers named icon buttons for Pin/Unpin, Centre and More for files, and Open or Close, by the directory's state as its 2D label offers them, Centre and More for directory hubs. Its glyphs match the compact 2D controls; accessible names, titles and Pin's pressed state carry the current action without replacing the focused button. Only a whole-file `*` pin shows Unpin; a file retained by individual symbols still offers Pin to retain every interface. The application owns these operations, including the same directory Centre action used by the reader and context menu.
- The strip follows the hovered or inspected sphere's screen projection and stays inside the viewport. It keeps its target and position while the pointer or keyboard focus is inside the controls, or their context menu is open, so a settling sphere cannot pull a button away. The menu's explicit close callback releases that target after restoring focus; an older menu cannot clear a newer target. A short hover-exit grace lets the pointer cross the gap to the strip; otherwise off-screen targets and active drags hide it. Inspection changes are read during the existing animation loop without feeding the graph or steering the camera.
- More, a stationary primary hold, right-click release, or Context Menu/Shift+F10 on the focus label or controls opens the shared commands. A hold consumes the later inspection click. Node drag, camera movement, additional pointers, wheel input, cancellation, lost pointer capture, Escape, window blur and view deactivation cancel a pending hold. Right-click waits for release so right-drag remains available to the native camera controls. Centre/Open are the visible navigation actions; no double-click shortcut is required.
- The application owns one pointer target, picked from the rendered spheres in its existing animation loop. Pointer changes, simulation ticks, camera/projection changes, canvas movement, resizing and rendering request a new pick; an unchanged picture needs none. Picking stops while hidden, dragging or without a pointer. The library keeps its link tooltip and drag mechanics, but its hover callback does not write application attention: its two object caches do not reset on viewport exit and can miss same-object re-entry, while mixing those callbacks with a synthetic entry target can leave a target the library never observed.
- When the pointer leaves a sphere or the viewport, attention returns to the explicit menu target or the deliberate keyboard target identified by `:focus-visible`, otherwise to the retained scope. Keyboard focus establishes its target's preview; focus left behind by a mouse click only keeps the controls reachable. This distinction lets moving away after the last Unpin restore the full graph without a second click, and lets a temporary pointer peek return to the actual keyboard target. Touch release and cancellation clear pointer ownership rather than inventing hover after a finger lifts. Leaving keyboard focus schedules release as well.
- Shared pins, opened directories and paths fade unrelated nodes and connections. Hover temporarily reveals the inspected file's incident connections, including outside the retained scope; leaving the viewport restores current retained attention. Perspective changes keep the subject’s screen anchor while preserving the current viewing direction.
- Projected names stay at reading size. The subject, retained files and path endpoints take priority, followed by directory landmarks and neighbours; more contextual names appear when space permits. Repeated filenames gain enough directory suffix to distinguish them. Placement avoids other names, panels and viewport clipping while preferring a previously usable side. Names inspect and offer the same keyboard/context actions as spheres; the old node tooltip is disabled to avoid a second name covering the first. This implements the owner's [October 23 label choice](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-23.1.record.md#turn-5).
- Depends on the external `3d-force-graph` library.

The separation of inspection from direct Pin controls follows the owner's [October 19 choice](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-19.1.record.md#turn-24), resumed [October 20](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md#turn-2): following connections should stay quick while preserving the place under the person's eye, and held gestures must yield to dragging.

In the structure layout (2026-10-14) the amber directory hubs and their containment links are the picture: only the links of the chosen layout make springs, so a reference pulls nothing there, and a hub new to the picture starts at the centroid of its members that already have positions while the files keep theirs, so the motion folds the network into the tree from where the eye left it, without repeating the first picture's hidden warmup. Containment is always drawn; a reference is drawn on demand, for the hovered file, within and out of the hovered hub's subtree, among the retained files and along a path. A hub’s persistent name identifies the directory and its tooltip counts visible files; its explicit Open action retains the directory through the application and frames its actual members about their own center, and the pin tray can release that retention in either representation. Directory camera anchoring belongs to this renderer so a preset change cannot accidentally substitute the last selected file for the focused directory. The hubs were first built inside the connectivity layout for [the October 14 request](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-11--pin-management-approved-ancestor-disclosure-and-directory-hubs); the owner moved them to a layout of their own [the same day](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-14.1.record.md#turn-4).

The native accessor setters can rebuild geometries and materials even when a newly supplied function returns the same values. Appearance therefore updates only when effective attention, the path or the layout changes; sphere geometry updates only when its size settings change. Force-only tuning builds the field again and unfolds the picture at full strength, without rebuilding an unchanged appearance.

The shared spatial projection supplies counted file pairs and optional related documents. Sphere volume encodes public-symbol count plus a baseline unit, and a hub's the sum of its members'; preferred link gaps encode documented coupling with diminishing returns and collision clearance. Packing changes move existing positions while keeping the selected screen anchor; unchanged settings move nothing. Name tooltips expose full paths and symbol or membership counts. The graph reports its motion with aria-busy, and the renderer’s actual spheres supply perspective-transition sizes. The engine runs until the motion finds the spheres still and stops it by raising the library's minimum alpha past any alpha, so aria-busy falls when the picture is still; the library's fifteen-second cooldown is no ceiling, so a slow renderer shows the still picture later rather than an unsettled one as the result. From 2026-10-16 to 2026-10-21 the engine stopped at D3's own minimum alpha, 0.001, some three hundred ticks after a reheat; before that, no minimum was set and it ran out the fifteen seconds after every change. The link opacity is 1, so that the alphas the link colours carry are the ones drawn; the library's default of 0.2 had multiplied them five-fold until the same day, a revealed reference at 0.1 and containment at 0.07. An asset's sphere has its own colour rather than the fallback grey. This supports [the shared-preset design](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-6--shared-presets-and-advanced-tuning-approved-for-implementation).

One update path for every membership change (2026-10-18, ticket C2 of [the change-over-time plan](../../../../../../../.mdmd/layer-3/change-over-time.mdmd.md#open-questions)): a pin that brings a filtered file in, a filter toggled, a layout switched and a step of history all pass through `render`, which carries the picture and eases it at the update energy. The node objects are kept by id, as before, and since this day the link objects by pair too, so that the library's data join, which binds a line's object to its datum, keeps the line across a change; before, every render handed it new link objects and it rebuilt every line, 65 to 88 ms a step with 2,650 links in [the probe of 2026-10-16](../../../../../../../AI-Agent-Workspace/Probes/2026-10-16/change-over-time/README.md), its third defect. A sphere that was in the picture keeps its place and a new one starts beside what holds it by `placeNewSpheres`, which generalizes the hub-at-centroid rule of 2026-10-14 to born files. The feed hands the library the data and `move` begins the motion at the update energy, held where the spheres stand, or unfolding afresh for a new layout, and says busy only when there will be ticks; at zero the engine is stopped before its first tick by an alpha minimum nothing is below. Only the first picture warms up, a hundred ticks unseen. The lever governs changes to what is shown: a change of the forces (a slider, a preset, which changes the equilibrium itself) unfolds the picture at full strength, and a hand moves it at full strength whatever the last change was fed, held where the spheres stood when the hand took hold and again where they stand when it lets go; the energy slider itself is left out of the settings that move the picture, so moving it stirs nothing. Opening a directory in 3D changes attention and the camera and not the membership, so it feeds nothing. Since 2026-10-21 one force does all the moving, `motionForce` of [the layout module](forceGraphLayout.ts.mdmd.md), with the library's charge and centring removed and its link force kept at strength zero so that every line's ends resolve; each sphere is tethered to where it stood when the motion began, the owner's choice of that day ([Turn 5](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-21.1.record.md#turn-5)). Before, the feed set the share of alpha D3's forces saw and the alpha the engine stopped at.

A moment of the history in place of today (2026-10-18, ticket C4 of [the change-over-time plan](../../../../../../../.mdmd/layer-3/change-over-time.mdmd.md#open-questions)): `setMoment` hands the view a moment's snapshot as the data, with the renames from the moment shown before and the energy to feed the change at; `render` re-keys the cached nodes, links, objects and the hovered, focused and action-target ids through those renames first (`rekey.ts`), so that a renamed file or hub keeps its sphere, its lines and its place under its new id, then reads today's pins, subject, inspection, path and open directories where they stand at the moment, retaining nothing for a pin that does not stand there, and draws the related documents the moment's files linked to then, which the history carries since 2026-10-20 (before, a moment drew none); a document today's bundle lacks says so in its label and opens nothing. Inspection and explicit actions on a past sphere resolve to the file or directory as it stands today; a file gone since has no current action, and a directory acts only while today's graph contains a file beneath it. This opens today's evidence rather than implying the bundle contains that past day's full docs. `settle` eases the standing picture at the tuning's energy after a thumb's drag placed it at zero. Names are placed around panels and controls, so the step panel and scrubber never have spatial names written over their words. `data-history-step` on the container says which step is shown, empty for today, for the specs.

A kept link's ends are set to the live node objects for its ids on every render (2026-10-18), since D3 keeps an end once resolved to an object and a rename or a death can leave that object behind in the cache: the lines to such objects led nowhere after a play through this repository's history ([Turn 8](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-17.1.record.md#turn-8)); and a past moment's `symbolCount` is cleared from a node when today's payload names its symbols instead. Held, with the re-keying's rule, by the scrubber spec's walk over a rename onto a dead file's path.
- The citing documents (2026-10-22, [the decision](../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#related-documents-run-both-ways-a-docs-cited-by-section-is-generated-from-the-documents-own-links-recorded-2026-10-22)) are shown by a filter of their own, Show Citing Docs, as the cited documents are by Show Related Docs, each kind of link passed to the data by its direction; a `cited-by` line is drawn in a lighter violet than a `related-doc` line, both thin, and both carry an arrow at the cited end, four units long, so that the direction of a citation is read off the line.

The October 23 rendering pass introduced instanced drawing through `forceGraphBatches.ts`, preserving the library's placement and interaction objects. Since the October 24 sizing pass, spheres follow the node resistance, straight wires use projected round-capped strokes, and arrows retain their native geometry. Per-instance RGBA and depth rules remain shared with the native objects. This addresses the cost exposed by useful neighbourhood framing without dropping graph relationships.

Wire thickness gives a counted file pair a visible weight: a baseline diameter times `min(3, 1 + 0.375 × log2(count))`. The public Wire Thickness control scales all wires, with containment at the baseline and citations at half of it; these distinct relationships never contribute to a code pair's reference count. Width depends on documented multiplicity, not the spring's current length. Changing the scale updates geometry without waking the motion or changing the camera, and historical steps use their own counts. This follows the owner's [count-driven choice](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-24.1.record.md#turn-5) and [request for a global dial after judging the first candidate too heavy](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-24.1.record.md#turn-7).

Independent node and wire resistance interpolate between perspective at zero and constant CSS-pixel size at one, following the owner's [request for partial resistance](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-24.1.record.md#turn-11). Drawing, picking, label offsets and captured scene radii agree on the apparent spheres; physical forces retain native radii and name disclosure retains perspective proximity. The [Connections tuning pass](../../../../../../../AI-Agent-Workspace/Probes/2026-10-24/connections-tuning/README.md) selected node resistance .45, wire resistance .9 and baseline width .9, with lower ordinary wire alpha and wider label spacing. Appearance controls leave the camera and physical positions in place. The spatial legend derives its key from the graph actually drawn, including filtered files retained by a pin.

The picture enters in pieces (2026-10-28, the owner's choice of a gradual reveal for 3D, [Turn 2](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-28.1.record.md#turn-2); the order and growth are [the reveal module's](forceGraphReveal.ts.mdmd.md)). `reveal` holds the order, computed when the membership changes over the retained files and the subject, the whole's live objects and wires, and how many have entered; a change keeps what is shown and carries on in the new order, the attention set in the piece that enters now. `shownData` is the piece the library holds, each newcomer placed beside what holds it as it enters rather than at render time, so that it starts beside where its neighbours stand then. `grow`, called from the batches' per-frame hook, asks for the next share only once the last piece has been applied, known by the identity of the array the simulation hands back (`onNodes`), and drawn (`spheresOnScreen`): the library applies a request one task later and draws it a frame later, and a second request before then replaces the first and skips a piece, which the reveal spec caught. Stillness part way through a reveal does not stop the engine. The first piece warms hidden by the library's hundred ticks as every first picture did; a feed no longer reheats the engine itself, since the library resumes it when it applies the piece, and reheating first ticked the old picture once more ([the Turn 4 work notes](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-28.1.record.md#turn-4-work-notes)).

The motion runs within `FRAME_BUDGET`, 10 ms a frame, once the first picture is on screen (2026-10-28, the owner's standard that the page never reach the browser's offer to kill it, [Turn 4](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-28.1.record.md#turn-4)); the library's hidden warm-up of the first piece runs whole ticks as before. The reveal enters a piece a frame once the last is on screen, whatever the motion's ticks take: while a tick fits a frame that is a piece a tick, as the headless twin gives it, and at sizes where a tick spans frames the page's picture is in sooner than the twin's while its motion catches up; growing a piece a tick was tried first and left T3's reveal at half its spheres after four minutes in software ([the Turn 4 work notes](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-28.1.record.md#turn-4-work-notes)). At T3's size the whole picture was in 30 s after opening in headless Chromium, and the settling after it runs at the budget: a tick of the field there is seconds of physics spread over frames, so the picture settles over minutes while the page answers. The lever for a faster settle is the approximation; the reserve, now that the motion is in parts, is a worker thread, which would give the physics a core of its own.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ForceGraphLink` {#symbol-forcegraphlink}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphView.ts#L63)

##### `ForceGraphLink` — Summary
A link in the Force Graph between two nodes.

#### `ForceGraphNode` {#symbol-forcegraphnode}
- Type: type
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphView.ts#L71)
- Returns: [`SpatialGraphNode`](./forceGraphData.ts.mdmd.md#symbol-spatialgraphnode)

##### `ForceGraphNode` — Summary
A node in the Force Graph, extending the payload with optional archetype.

#### `ForceGraphData` {#symbol-forcegraphdata}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphView.ts#L80)

##### `ForceGraphData` — Summary
Complete data structure for the Force Graph view.

#### `ForceGraphViewOptions` {#symbol-forcegraphviewoptions}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphView.ts#L91)

##### `ForceGraphViewOptions` — Summary
Options passed to the Force Graph view factory.

#### `ForceGraphViewApi` {#symbol-forcegraphviewapi}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphView.ts#L115)

##### `ForceGraphViewApi` — Summary
Public API surface of the Force Graph view.

#### `createForceGraphView` {#symbol-createforcegraphview}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphView.ts#L138)
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
- [`spatial-legend.renderSpatialLegend`](../panels/spatial-legend.ts.mdmd.md#symbol-renderspatiallegend)
- [`types.ExplorerState`](../types.ts.mdmd.md#symbol-explorerstate) (type-only)
- [`forceGraphAppearance.spatialNodeStyle`](./forceGraphAppearance.ts.mdmd.md#symbol-spatialnodestyle)
- [`forceGraphBatches.batchSpatialGraph`](./forceGraphBatches.ts.mdmd.md#symbol-batchspatialgraph)
- [`forceGraphBatches.drawSpatialGraphOnChange`](./forceGraphBatches.ts.mdmd.md#symbol-drawspatialgraphonchange)
- [`forceGraphCamera.CameraPoint`](./forceGraphCamera.ts.mdmd.md#symbol-camerapoint)
- [`forceGraphCamera.focusedCameraPosition`](./forceGraphCamera.ts.mdmd.md#symbol-focusedcameraposition)
- [`forceGraphCamera.frameCameraSpheres`](./forceGraphCamera.ts.mdmd.md#symbol-framecameraspheres)
- [`forceGraphCamera.screenAnchorTranslation`](./forceGraphCamera.ts.mdmd.md#symbol-screenanchortranslation)
- [`forceGraphCamera.wheelZoomCamera`](./forceGraphCamera.ts.mdmd.md#symbol-wheelzoomcamera)
- [`forceGraphData.SpatialGraphNode`](./forceGraphData.ts.mdmd.md#symbol-spatialgraphnode)
- [`forceGraphData.SpatialLinkKind`](./forceGraphData.ts.mdmd.md#symbol-spatiallinkkind)
- [`forceGraphData.directoryNodeId`](./forceGraphData.ts.mdmd.md#symbol-directorynodeid)
- [`forceGraphData.labelNamesOf`](./forceGraphData.ts.mdmd.md#symbol-labelnamesof)
- [`forceGraphData.spatialGraphOf`](./forceGraphData.ts.mdmd.md#symbol-spatialgraphof)
- [`forceGraphLabels.LabelBox`](./forceGraphLabels.ts.mdmd.md#symbol-labelbox)
- [`forceGraphLabels.SpatialLabel`](./forceGraphLabels.ts.mdmd.md#symbol-spatiallabel)
- [`forceGraphLabels.placeSpatialLabels`](./forceGraphLabels.ts.mdmd.md#symbol-placespatiallabels)
- [`forceGraphLayout.MotionForce`](./forceGraphLayout.ts.mdmd.md#symbol-motionforce-interface)
- [`forceGraphLayout.MotionStart`](./forceGraphLayout.ts.mdmd.md#symbol-motionstart)
- [`forceGraphLayout.linkPulls`](./forceGraphLayout.ts.mdmd.md#symbol-linkpulls)
- [`forceGraphLayout.motionForce`](./forceGraphLayout.ts.mdmd.md#symbol-motionforce-function)
- [`forceGraphLayout.placeNewSpheres`](./forceGraphLayout.ts.mdmd.md#symbol-placenewspheres)
- [`forceGraphLayout.spatialNodeRadius`](./forceGraphLayout.ts.mdmd.md#symbol-spatialnoderadius)
- [`forceGraphLayout.spatialNodeValue`](./forceGraphLayout.ts.mdmd.md#symbol-spatialnodevalue)
- [`forceGraphLayout.symbolCountOf`](./forceGraphLayout.ts.mdmd.md#symbol-symbolcountof)
- [`forceGraphReveal.REVEAL`](./forceGraphReveal.ts.mdmd.md#symbol-reveal)
- [`forceGraphReveal.nextRevealCount`](./forceGraphReveal.ts.mdmd.md#symbol-nextrevealcount)
- [`forceGraphReveal.revealOrder`](./forceGraphReveal.ts.mdmd.md#symbol-revealorder)
- [`forceGraphSizing.spatialSizeScale`](./forceGraphSizing.ts.mdmd.md#symbol-spatialsizescale)
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

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../../../../layer-3/architectural-decisions.mdmd.md)
- [`.mdmd/layer-3/change-over-time.mdmd.md`](../../../../../../layer-3/change-over-time.mdmd.md)
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
