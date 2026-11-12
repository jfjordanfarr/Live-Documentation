# packages/explorer/src/client/views/localView/controller.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/controller.ts
- Generated At: 2026-11-12T22:02:41.188Z

## Authored
### Purpose

Controller class for the 2D Local Map. Owns its render lifecycle, camera, and visual response to shared exploration actions while drawing every scope through the same directory-aware branch stage and router.

### Notes
- The [November 5 reading repair](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-04.1.record.md#turn-9) forwards newly retained targets into scoped reading presentation and clears that presentation on outward scale changes. Hover preview no longer overwrites the chosen click/hover anchor policy. The reading visit supplies a stable effective anchor to the native renderer, using the previewed card when no clicked or selected identity exists. Genuine inspection and contextual actions end that temporary visit after naming their acted-on identity, so its return cannot later undo the action.
- The [November 4 learning-journey pass](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-04.1.record.md#turn-8) keeps native keyboard focus inside the unobstructed frame with minimal panning, including during geometry motion. Touch presses over non-interactive card prose remain taps or holds until movement exceeds the existing activation-cancel threshold; then they own the camera and pan. Mouse presses on cards and native controls keep their existing behavior. A newly grown header may move a previously visible acted-on title/row just below its edge; this is the narrow exception to keeping screen anchors unchanged when the toolbar changes height.
- An explicit search or focus request names a file or a particular symbol row. Its target is measured after the retained layout's current move, then framed inside the usable canvas, including the row's actions and excluding the reader and floating controls. The requested row becomes the held identity for subsequent layout changes. A camera gesture cancels a pending request, so delayed layout work cannot pull the view back after the person takes over ([November 3](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/Summarized/2026-11-03.1.SUMMARIZED.md#turn-2)).

- Created in the [December 4 modularisation](../../../../../../../../AI-Agent-Workspace/ChatHistory/2025/12/Summarized/2025-12-04.SUMMARIZED.md#turn-14-local-map-modularization-the-refactor), which separated the growing Local Map's orchestration, drawing and public API. After the [owner's October 12 walkthrough](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-12.1.record.md#turn-3) found unpinned links and paths still using older renderers, all scopes came through one branch scene. This controller owns the lifecycle; scope construction stays in `branches.ts`, the branch renderer owns cards, placement and motion, and `connections.ts` draws the wires.
- A stage is reused within the same mode to preserve card identity and motion. A path uses the view with its own first-file fit; entering or leaving path mode replaces the stage, and leaving restores the exploration camera after drawing. An empty graph clears the wires through `clearConnections`, so the runtime forgets its layer with the overlay's children (2026-10-16). These were the remaining responsibilities of the retired `render.ts`, carried here with its source removed.
- The camera: `fitMapToContent` frames the selected card with its surroundings, at reading size (the whole exploration when it fits, 2026-10-05), `fitMapToPath` frames a drawn path from its first file at reading size, and both measure the map layer's own frame with its transform reset rather than the whole view. A mouse press on a card, or a press in the pathfinder toolbar, never starts a drag, because a drag marks the camera as the person's own and no render re-fits it afterwards; toolbar clicks used to do that and left Clear unable to bring the subject back (3,846 px off, measured by the still-picture instrument, [Turn 10 of 2026-10-01](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-01.1.record.md#turn-10)). A layer observer shifts the camera, and any running animation's target, by however much the toolbar above the map grows or shrinks, so a status line is not a camera move.
- File bodies, symbol rows and directory names inspect their evidence through application callbacks. Inspection leaves the subject, pins and path alone and preserves its acted-on identity; separate Pin, Centre and Open controls change the exploration. This is the grammar accepted in [October 19, Turn 24](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-19.1.record.md#turn-24) and resumed in [October 20, Turn 2](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md#turn-2). The application owns pin, directory and subject transitions from every view. A row's direct Pin retains the established narrow/add/release/last-symbol fallback rule from [the October 15 decision](../../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#clicks-pin-what-they-name-and-the-subject-stays-where-it-is-recorded-2026-10-15); the earlier body-click binding is superseded. The subject remains visible without an implicit pin. Hover highlighting preserves exploration scope; temporary reading remeasures its presentation (clarified in the November 5 repair above).
- `capturePinChange` and `captureDirectoryChange` provide the visual half of an application action: remember the visible row, title, label or box before the state changes, then restore its position and the relevant native control's keyboard focus after rendering. Closing a card also clears its 2D reveal override. A capture made while 2D is hidden does not claim its camera. Perspective changes use the file-title anchor to keep the subject recognizable.
- Context gestures are delegated from the viewport, so rebuilt cards and reused labels share one gesture lifetime. A stationary primary-pointer hold opens the same application menu as More, right-click or Menu/Shift+F10; it never also performs Inspect on release. Movement beyond the drag tolerance, another pointer, wheel input, cancellation, Escape, loss of focus or a hidden page cancels the pending hold. Movement also suppresses accidental activation of an icon button, including events whose target is inside its SVG. Visible commands retain their ordinary one-activation meaning; no double-click shortcut is required.
- The pan and the pinch are on pointer events since 2026-10-15, one pointer dragging and two zooming around their midpoint and panning with it, so that a finger does what a mouse does on the 2D map; the pan had listened to mouse events alone, which a touch screen's drag never sends. The viewport's `touch-action: none` keeps the browser's own gestures off it.
- Explicit pathfinding saves the exploration camera and restores it when the path is left, accounting for the report’s changed height. `setActivePath(null)` is a no-op when no path is active; independent pins are retained throughout. A new pin or directory opening clears the path directly before rendering, as before, without asking this view to restore the former camera; the application owns the destination and its persistence.
- `previousTops` (2026-10-06) keeps where the last branch picture stood each card, by its top; the renderer offers that order as a start of the order step and prices a start by the pairs of cards it would swap, so a re-layout keeps the picture put unless another arrangement is clearly cheaper. The controller forgets it when the branches are left.
- `stage` keeps the branch picture's elements across renders, as requested in [October 6, Turn 16](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-06.1.record.md#turn-16). `lastInteracted` and `lastInteractedSymbol` name the latest acted-on file, directory or symbol row; inspecting or opening its menu counts, as does hovering when `holdStill` says so. The renderer holds that visible identity through motion, including a row that changes order within its card, and can transfer the hold when another item is acted on mid-move. This supports the owner's connection-following requirement in [October 19, Turn 24](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-19.1.record.md#turn-24). `dropStage` ends a running move when the branches are left or the controller is disposed.
- The opened directories (2026-10-08, [the decisions log](../../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#directories-open-and-close-inside-the-local-map-three-states-on-one-scale-recorded-2026-10-08)): `openDirectories` reads the set the application owns beside the pins. The application's open and close actions change that set; `captureDirectoryChange` keeps the label or box where it was on screen and marks the directory as what the move holds still. The subgraph's center may be null, for a picture entered by directory.
- Pending path renders are coalesced: an explicit render cancels its queued frame, so a shared path can be resolved before first paint without drawing twice. Wheel input zooms within 2D; the application changes perspective only through explicit controls ([owner's correction](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-12.1.record.md#turn-3)).
- The render is owed, not forced (2026-10-16, [the decision](../../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#the-local-maps-work-stays-with-the-view-and-the-wires-keep-their-elements-recorded-2026-10-16)): `render()` runs only while the map is the view shown (`isShown`: the map view in its 2D perspective); asked for otherwise it is owed, and `show()`, which the application calls when the map is shown again, runs it, or, when none is owed and a picture stands, resumes the continuing search where it paused. The two guards that skipped a render in 3D went, since `render()` decides for itself, and the hold of a clicked label or row is measured only on a shown map, so a change made in 3D does not mark the 2D camera as the person's own. A `visibilitychange` resumes the search when the page is visible again. Before, the search went on behind another view and a return drew the unchanged picture again (240 ms, measured) and began the search anew.

The November 1 directory-arrival repair keeps the unfolding label anchor through the branch animation, then settles the contents into the available frame with the minimum camera movement. A wheel or background-drag gesture cancels that pending arrival. Direct directory URLs and ordinary Open actions now use the same final frame rule. The usable frame also ends above the actual floating control boxes, so a fitted lower card cannot sit behind the map controls; edge signs use that same frame. See the [accepted review](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-01.1.record.md#turn-2).

November 4 native reading calibrates a portrait card to the usable frame before interpreting zoom. A reset waits for the native height move; a resize follows the remembered reading subject until manual camera input or an exploration action takes over. Temporary description visits retain a scene/camera return point, while deliberate book controls use the normal focus/anchor transaction and independent reading state. See the [integration record](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-04.1.record.md#turn-2).

On [November 5](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-1) hover reading went: the preview and visit-cancel paths and their options are gone, `readNode` opens or folds what a name names through the reading surface and falls back to inspection for a card with nothing to open, and `captureReadingChange` holds the card's name rather than the tapped row, since holding the row let the re-solved layout seat the taller card higher and leap its name by 103 px; focus returns to the name or book used. `refreshReadingGeometry` is called only for the zoom fold and restore, a resize and an arrival that unfolds. Under the hover anchor tuning the render after a tap puts a new row under the resting pointer, and Chromium reports that as a hover; `readingHold` keeps `highlightSymbolConnections` from re-anchoring to it while the reading change's move runs, since the renderer would switch its hold to the row and leap the name (272 px in the browser spec); the renderer clears the flag when the move ends.

The same day's comparison ([Turn 4](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-4)): the composition reaches the reading surface as `mode`, and `render` sets `--slot-lines` from Slot Lines. Since [Turn 6](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-6) the zoom handler only fades prose below reading scale, with the same two ratios; no re-measure follows a zoom, and `capturePinChange` no longer carries the newly retained symbol that fed the fold's reveal exception.

The card ladder ([Turn 9](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-9), built under [Turn 10](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-10)): `applyLevelOfDetail` turns the zoom ratio against the calibrated reading scale into a band, overview, far, middle, reading or close, with edges at 0.25, 0.45, 0.74 and 1.3 and a 15 % margin upward so that a zoom resting on an edge does not chatter, writes it as `data-lod` on the map for the stylesheet, and sets `--text-scale` and `--control-scale` from the Text and Control Resistance tunings (the ratio to the power of minus the resistance, clamped) and `--prose-scale` and `--prose-lines` so that a description gains lines as the camera comes closer. It runs at every transform update and at every render. The growing composition still only fades below reading scale; the ladder draws slot cards.

Since [Turn 11](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-11) `applyLevelOfDetail` also writes `--name-growth`, the Name Growth lever clamped to at least 1, which the stylesheet multiplies into a name's held size below reading scale; the rooms a name may grow into are measured by the card reading, not here.

Since [Turn 12](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-12--november-6) `updateMapTransform` feeds the ladder the frame's own scale rather than the zoom animation's destination, after the owner saw the fonts "jump up in size before the viewport has actually reached its terminal zoom destination".

The card ladder as breakpoints (2026-11-06, the owner's [Turns 17 to 19](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-17--november-6)): `applyLevelOfDetail` asks `ladder-steps` for the band and for a step every 20 % of zoom, and writes `data-lod`, `data-step`, `--text-scale`, `--control-scale` and `--name-growth` only when the band, the step or a lever changes, where it had written five custom properties at every frame. The close band's prose shrink (`--prose-scale`, `--prose-lines`) is gone, so that zooming in shrinks nothing. On `tests/e2e/still-picture.ts` a wheel zoom out went from 15 to 22 frames in 1.2 s to 35 to 51, and its style recalculation from about 0.67 s to 0.08 to 0.11 s; the tables are in [the card-breakpoints evidence](../../../../../../../../AI-Agent-Workspace/Screenshots/2026-11-06/card-breakpoints/README.md).

Since the same pass `watchCamera` says `data-camera="moving"` on the container while a drag, a pinch, inertia or an animation moves the camera, and gives the viewport the class `camera-moving` meanwhile, which alone makes it a compositor layer: the always-promoted layer of Turn 12 was rastered once and stretched, the blur close up and the aliasing far out the owner showed in Turn 17. An instant jump, such as a Zoom button's, is no motion. When a step changes, the wires are drawn again once, the frame after, since the anchor dots they end at are drawn at a new size from their edge beside the name, and the wires' measurer reads the dots as drawn (an independent oracle in `local-map-motion.spec.ts` holds every drawn wire end to its dot as drawn; an earlier attempt in this pass that measured the dots' laid-out boxes instead broke it). `animateCamera` starts every eased move of the controller's own and says so at once, so that a test waiting on the camera (`localMapSettled`) cannot read the picture in the frame before the move's first step; while the camera moves it is looked at once a frame, since a release and inertia's last frame end the motion without another camera change.

Since the far bands' rounds (2026-11-06) the controller draws the wires again on any change the ladder writes, a band's included, since a dot's place follows its name's held size and the overview band draws other wires; derives the farthest zoom (`zoom-limits.ts`) whenever it measures the picture, from the frame as last read and the calibrated reading scale, and brings a camera left beyond it to it at once, unless a gesture or a move holds the camera; and tells the application through `onZoomLimits` when the camera stands at its farthest or closest zoom, so that the Zoom buttons are disabled there.

Since the restored reading books ([November 8, Turn 3](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-08.1.record.md#turn-3-additional-reading-feedback-during-the-review), continuing November 9 UTC), a change of the slot card's band refreshes the reading controls after writing the new `data-lod`. Slot prose follows that band, while the growing composition retains its separate visibility thresholds. A book's saved intent and its actually shown explanation therefore stay distinguishable as the camera crosses a band. This refresh occurs only when the band changes; it neither measures nor changes geometry.

The same round adds `tryRefreshReading` at the application boundary. It permits the fixed-slot presentation refresh only for the shown view with an existing stage and no pending or owed render. The renderer checks scope, row disclosure and card controls before any write. Successful refresh leaves the scene and its search in place; a structural reading change uses the existing capture/render/restore transaction.

Since 2026-11-10 `applyLevelOfDetail` also serves Tuning's Zoom Looks, a trial beside the ladder ([Turn 5 of the November 10 record](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-10.1.record.md#turn-5)): with three looks and fixed slots it writes the look's band as `data-lod`, the look as `data-look` beside `data-looks="three"`, step 0 for the reading look and no step for the others, and the look's one held scale for names and controls, so that the stylesheet's band rules draw each look and nothing changes between its edges; at a change of look `morphLook` writes, before the new look, the look left (`data-look-from`) and its scale (`--look-from-scale`), the zoom ratio at which that look was last drawn (kept as `lookRatio`) over the ratio now (`--look-zoom`) and the lesser of that and 1 (`--look-keep`), and sets the class `local-look-fading` afresh for 200 ms. From these the stylesheet makes each held thing that both looks draw travel from its size on screen in the look left to its new one over 160 ms, and the file's name cross over in place. The zoom ratio counts since the root's third review of the trial (the same day): a Zoom button moves the camera at once, and a start reckoned from the looks' scales alone made everything bulge by a press's 1.2 on the way in. The band and step it keeps are computed as before whatever the choice, and with the default steps it writes what it wrote before.

Since 2026-11-12 `fitWhole` is the 2D map's Fit current scope, the 3D map's first toolbar control: a person's press only, it takes the camera as a gesture does, eases to `wholeTransform` over everything the map shows, and leaves the camera the person's (`mapUserAdjusted`), so that no later render frames back toward the arrival ([the first-visit review](../../../../../../../../AI-Agent-Workspace/Screenshots/2026-11-12/first-visit/README.md), finding 5). `resetZoom`, the control now named Return to reading size, is unchanged.

The directory flow trial's hover (2026-11-12): while opened directories stand in flow order, the card under the pointer or holding the keyboard's focus keeps its lines and the cards at their far ends, and the stylesheet fades every other line, card and closed box; a return's stubs light at both ends and its route is not drawn, since nothing may be added. The container listens for every card because a render builds the cards afresh, and the marks are written again after each drawing of the wires. A hovered symbol row's own highlight outranks it.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LocalViewController` {#symbol-localviewcontroller}
- Type: class
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/controller.ts#L77)
- Implements: [`LocalViewApi`](./types.ts.mdmd.md#symbol-localviewapi)

##### `LocalViewController` — Summary
Coordinates the native Local Map, independent exploration pins and explicit FROM/TO paths.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`dom.requireElement`](../../dom.ts.mdmd.md#symbol-requireelement)
- [`reading-state.readingFiles`](../../reading-state.ts.mdmd.md#symbol-readingfiles)
- [`branch-renderer.BranchStage`](./branch-renderer.ts.mdmd.md#symbol-branchstage)
- [`branch-renderer.createStage`](./branch-renderer.ts.mdmd.md#symbol-createstage)
- [`branch-renderer.dropStage`](./branch-renderer.ts.mdmd.md#symbol-dropstage)
- [`branch-renderer.refreshReadingGeometry`](./branch-renderer.ts.mdmd.md#symbol-refreshreadinggeometry)
- [`branch-renderer.refreshReadingPresentation`](./branch-renderer.ts.mdmd.md#symbol-refreshreadingpresentation)
- [`branch-renderer.renderBranches`](./branch-renderer.ts.mdmd.md#symbol-renderbranches)
- [`branches.BranchGraph`](./branches.ts.mdmd.md#symbol-branchgraph) (type-only)
- [`card-factory.CardContext`](./card-factory.ts.mdmd.md#symbol-cardcontext) (type-only)
- [`card-reading.CardReading`](./card-reading.ts.mdmd.md#symbol-cardreading)
- [`card-reading.ReadingTarget`](./card-reading.ts.mdmd.md#symbol-readingtarget)
- [`connections.clearConnections`](./connections.ts.mdmd.md#symbol-clearconnections)
- [`connections.drawConnections`](./connections.ts.mdmd.md#symbol-drawconnections)
- [`directory-flow.flowNeighbours`](./directory-flow.ts.mdmd.md#symbol-flowneighbours)
- [`directory-state.NO_OPEN_DIRECTORIES`](./directory-state.ts.mdmd.md#symbol-no_open_directories)
- [`directory-state.OpenDirectories`](./directory-state.ts.mdmd.md#symbol-opendirectories)
- [`edge-signs.EdgeSigns`](./edge-signs.ts.mdmd.md#symbol-edgesigns)
- [`edge-signs.FramePlace`](./edge-signs.ts.mdmd.md#symbol-frameplace)
- [`edge-signs.createEdgeSigns`](./edge-signs.ts.mdmd.md#symbol-createedgesigns)
- [`ladder-steps.LOOK_BANDS`](./ladder-steps.ts.mdmd.md#symbol-look_bands)
- [`ladder-steps.LOOK_SCALES`](./ladder-steps.ts.mdmd.md#symbol-look_scales)
- [`ladder-steps.LadderBand`](./ladder-steps.ts.mdmd.md#symbol-ladderband-type)
- [`ladder-steps.ZoomLook`](./ladder-steps.ts.mdmd.md#symbol-zoomlook-type)
- [`ladder-steps.ladderBand`](./ladder-steps.ts.mdmd.md#symbol-ladderband-function)
- [`ladder-steps.ladderScales`](./ladder-steps.ts.mdmd.md#symbol-ladderscales-function)
- [`ladder-steps.ladderStep`](./ladder-steps.ts.mdmd.md#symbol-ladderstep)
- [`ladder-steps.zoomLook`](./ladder-steps.ts.mdmd.md#symbol-zoomlook-function)
- [`layout-measure.Bounds`](./layout-measure.ts.mdmd.md#symbol-bounds)
- [`layout-measure.Frame`](./layout-measure.ts.mdmd.md#symbol-frame)
- [`layout-measure.LayoutExtents`](./layout-measure.ts.mdmd.md#symbol-layoutextents)
- [`layout-measure.applyContainerDimensions`](./layout-measure.ts.mdmd.md#symbol-applycontainerdimensions)
- [`layout-measure.cardReadingTransform`](./layout-measure.ts.mdmd.md#symbol-cardreadingtransform)
- [`layout-measure.computeFitTransform`](./layout-measure.ts.mdmd.md#symbol-computefittransform)
- [`layout-measure.computeLayoutExtents`](./layout-measure.ts.mdmd.md#symbol-computelayoutextents)
- [`layout-measure.computePathFitTransform`](./layout-measure.ts.mdmd.md#symbol-computepathfittransform)
- [`layout-measure.focusTransform`](./layout-measure.ts.mdmd.md#symbol-focustransform)
- [`layout-measure.settleTransform`](./layout-measure.ts.mdmd.md#symbol-settletransform)
- [`layout-measure.wholeTransform`](./layout-measure.ts.mdmd.md#symbol-wholetransform)
- [`layout-measure.withTransformReset`](./layout-measure.ts.mdmd.md#symbol-withtransformreset)
- [`pan-zoom.animateMapTransform`](./pan-zoom.ts.mdmd.md#symbol-animatemaptransform)
- [`pan-zoom.cancelInertia`](./pan-zoom.ts.mdmd.md#symbol-cancelinertia)
- [`pan-zoom.handleDragEnd`](./pan-zoom.ts.mdmd.md#symbol-handledragend)
- [`pan-zoom.handleDragMove`](./pan-zoom.ts.mdmd.md#symbol-handledragmove)
- [`pan-zoom.handleWheel`](./pan-zoom.ts.mdmd.md#symbol-handlewheel)
- [`pan-zoom.startDrag`](./pan-zoom.ts.mdmd.md#symbol-startdrag)
- [`pan-zoom.startInertia`](./pan-zoom.ts.mdmd.md#symbol-startinertia)
- [`pan-zoom.zoomAtPoint`](./pan-zoom.ts.mdmd.md#symbol-zoomatpoint)
- [`pan-zoom.zoomByFactor`](./pan-zoom.ts.mdmd.md#symbol-zoombyfactor)
- [`runtime.clearAnchorRegistry`](./runtime.ts.mdmd.md#symbol-clearanchorregistry)
- [`runtime.createRuntime`](./runtime.ts.mdmd.md#symbol-createruntime)
- [`runtime.getAnchor`](./runtime.ts.mdmd.md#symbol-getanchor)
- [`runtime.registerAnchor`](./runtime.ts.mdmd.md#symbol-registeranchor)
- [`state.LocalMapState`](./state.ts.mdmd.md#symbol-localmapstate)
- [`state.PathResult`](./state.ts.mdmd.md#symbol-pathresult)
- [`state.StateStore`](./state.ts.mdmd.md#symbol-statestore)
- [`state.createInitialState`](./state.ts.mdmd.md#symbol-createinitialstate)
- [`state.createStateStore`](./state.ts.mdmd.md#symbol-createstatestore)
- [`state.setActivePath`](./state.ts.mdmd.md#symbol-setactivepath)
- [`state.setHoveredSymbol`](./state.ts.mdmd.md#symbol-sethoveredsymbol)
- [`symbol-highlight.applySymbolHighlight`](./symbol-highlight.ts.mdmd.md#symbol-applysymbolhighlight)
- [`symbol-highlight.clearSymbolHighlightDOM`](./symbol-highlight.ts.mdmd.md#symbol-clearsymbolhighlightdom)
- [`symbol-highlight.computeSymbolHighlight`](./symbol-highlight.ts.mdmd.md#symbol-computesymbolhighlight)
- [`types.ColumnRole`](./types.ts.mdmd.md#symbol-columnrole) (type-only)
- [`types.LocalExplorationFrame`](./types.ts.mdmd.md#symbol-localexplorationframe) (type-only)
- [`types.LocalSubgraph`](./types.ts.mdmd.md#symbol-localsubgraph) (type-only)
- [`types.LocalViewApi`](./types.ts.mdmd.md#symbol-localviewapi) (type-only)
- [`types.LocalViewOptions`](./types.ts.mdmd.md#symbol-localviewoptions) (type-only)
- [`types.MapTransform`](./types.ts.mdmd.md#symbol-maptransform) (type-only)
- [`types.ReadingControl`](./types.ts.mdmd.md#symbol-readingcontrol) (type-only)
- [`zoom-limits.CLOSEST_SCALE`](./zoom-limits.ts.mdmd.md#symbol-closest_scale)
- [`zoom-limits.atScale`](./zoom-limits.ts.mdmd.md#symbol-atscale)
- [`zoom-limits.farthestScale`](./zoom-limits.ts.mdmd.md#symbol-farthestscale)
- [`pin-state.EMPTY_PIN_SET`](../pin-state.ts.mdmd.md#symbol-empty_pin_set)
- [`pin-state.PinSet`](../pin-state.ts.mdmd.md#symbol-pinset)
- [`pin-state.isSymbolPinned`](../pin-state.ts.mdmd.md#symbol-issymbolpinned)
- [`symbolAnchors.buildNormalizedAnchorKey`](../symbolAnchors.ts.mdmd.md#symbol-buildnormalizedanchorkey)
- [`symbolAnchors.tryBuildNormalizedKeyFromAnchorKey`](../symbolAnchors.ts.mdmd.md#symbol-trybuildnormalizedkeyfromanchorkey)
- [`types.ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../../../../../layer-3/architectural-decisions.mdmd.md)
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
