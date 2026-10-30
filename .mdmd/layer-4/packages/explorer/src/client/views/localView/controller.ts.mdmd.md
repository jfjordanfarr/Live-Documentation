# packages/explorer/src/client/views/localView/controller.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/controller.ts
- Generated At: 2026-10-30T15:02:32.496Z

## Authored
### Purpose

Controller class for the 2D Local Map. Owns its render lifecycle, camera, and visual response to shared exploration actions while drawing every scope through the same directory-aware branch stage and router.

### Notes

- Created in the [December 4 modularisation](../../../../../../../../AI-Agent-Workspace/ChatHistory/2025/12/Summarized/2025-12-04.SUMMARIZED.md#turn-14-local-map-modularization-the-refactor), which separated the growing Local Map's orchestration, drawing and public API. After the [owner's October 12 walkthrough](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-12.1.record.md#turn-3) found unpinned links and paths still using older renderers, all scopes came through one branch scene. This controller owns the lifecycle; scope construction stays in `branches.ts`, the branch renderer owns cards, placement and motion, and `connections.ts` draws the wires.
- A stage is reused within the same mode to preserve card identity and motion. A path uses the view with its own first-file fit; entering or leaving path mode replaces the stage, and leaving restores the exploration camera after drawing. An empty graph clears the wires through `clearConnections`, so the runtime forgets its layer with the overlay's children (2026-10-16). These were the remaining responsibilities of the retired `render.ts`, carried here with its source removed.
- The camera: `fitMapToContent` frames the selected card with its surroundings, at reading size (the whole exploration when it fits, 2026-10-05), `fitMapToPath` frames a drawn path from its first file at reading size, and both measure the map layer's own frame with its transform reset rather than the whole view. A press on a card or in the pathfinder toolbar never starts a drag, because a drag marks the camera as the person's own and no render re-fits it afterwards; toolbar clicks used to do that and left Clear unable to bring the subject back (3,846 px off, measured by the still-picture instrument, [Turn 10 of 2026-10-01](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-01.1.record.md#turn-10)). A layer observer shifts the camera, and any running animation's target, by however much the toolbar above the map grows or shrinks, so a status line is not a camera move.
- File bodies, symbol rows and directory names inspect their evidence through application callbacks. Inspection leaves the subject, pins, path and camera alone; separate Pin, Centre and Open controls change the exploration. This is the grammar accepted in [October 19, Turn 24](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-19.1.record.md#turn-24) and resumed in [October 20, Turn 2](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md#turn-2). The application owns pin, directory and subject transitions from every view. A row's direct Pin retains the established narrow/add/release/last-symbol fallback rule from [the October 15 decision](../../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#clicks-pin-what-they-name-and-the-subject-stays-where-it-is-recorded-2026-10-15); the earlier body-click binding is superseded. The subject remains visible without an implicit pin. Hover dims unrelated content without rearranging the scene.
- `capturePinChange` and `captureDirectoryChange` provide the visual half of an application action: remember the visible row, title, label or box before the state changes, then restore its position and the relevant native control's keyboard focus after rendering. Closing a card also clears its 2D reveal override. A capture made while 2D is hidden does not claim its camera. Perspective changes use the file-title anchor to keep the subject recognizable.
- Context gestures are delegated from the viewport, so rebuilt cards and reused labels share one gesture lifetime. A stationary primary-pointer hold opens the same application menu as More, right-click or Menu/Shift+F10; it never also performs Inspect on release. Movement beyond the drag tolerance, another pointer, wheel input, cancellation, Escape, loss of focus or a hidden page cancels the pending hold. Movement also suppresses accidental activation of an icon button, including events whose target is inside its SVG. Visible commands retain their ordinary one-activation meaning; no double-click shortcut is required.
- The pan and the pinch are on pointer events since 2026-10-15, one pointer dragging and two zooming around their midpoint and panning with it, so that a finger does what a mouse does on the 2D map; the pan had listened to mouse events alone, which a touch screen's drag never sends. The viewport's `touch-action: none` keeps the browser's own gestures off it.
- Explicit pathfinding saves the exploration camera and restores it when the path is left, accounting for the report’s changed height. `setActivePath(null)` is a no-op when no path is active; independent pins are retained throughout. A new pin or directory opening clears the path directly before rendering, as before, without asking this view to restore the former camera; the application owns the destination and its persistence.
- `previousTops` (2026-10-06) keeps where the last branch picture stood each card, by its top; the renderer offers that order as a start of the order step and prices a start by the pairs of cards it would swap, so a re-layout keeps the picture put unless another arrangement is clearly cheaper. The controller forgets it when the branches are left.
- `stage` keeps the branch picture's elements across renders, as requested in [October 6, Turn 16](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-06.1.record.md#turn-16). `lastInteracted` and `lastInteractedSymbol` name the latest acted-on file, directory or symbol row; inspecting or opening its menu counts, as does hovering when `holdStill` says so. The renderer holds that visible identity through motion, including a row that changes order within its card, and can transfer the hold when another item is acted on mid-move. This supports the owner's connection-following requirement in [October 19, Turn 24](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-19.1.record.md#turn-24). `dropStage` ends a running move when the branches are left or the controller is disposed.
- The opened directories (2026-10-08, [the decisions log](../../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#directories-open-and-close-inside-the-local-map-three-states-on-one-scale-recorded-2026-10-08)): `openDirectories` reads the set the application owns beside the pins. The application's open and close actions change that set; `captureDirectoryChange` keeps the label or box where it was on screen and marks the directory as what the move holds still. The subgraph's center may be null, for a picture entered by directory.
- Pending path renders are coalesced: an explicit render cancels its queued frame, so a shared path can be resolved before first paint without drawing twice. Wheel input zooms within 2D; the application changes perspective only through explicit controls ([owner's correction](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-12.1.record.md#turn-3)).
- The render is owed, not forced (2026-10-16, [the decision](../../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#the-local-maps-work-stays-with-the-view-and-the-wires-keep-their-elements-recorded-2026-10-16)): `render()` runs only while the map is the view shown (`isShown`: the map view in its 2D perspective); asked for otherwise it is owed, and `show()`, which the application calls when the map is shown again, runs it, or, when none is owed and a picture stands, resumes the continuing search where it paused. The two guards that skipped a render in 3D went, since `render()` decides for itself, and the hold of a clicked label or row is measured only on a shown map, so a change made in 3D does not mark the 2D camera as the person's own. A `visibilitychange` resumes the search when the page is visible again. Before, the search went on behind another view and a return drew the unchanged picture again (240 ms, measured) and began the search anew.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LocalViewController` {#symbol-localviewcontroller}
- Type: class
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/controller.ts#L68)
- Implements: [`LocalViewApi`](./types.ts.mdmd.md#symbol-localviewapi)

##### `LocalViewController` — Summary
Coordinates the native Local Map, independent exploration pins and explicit FROM/TO paths.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`dom.requireElement`](../../dom.ts.mdmd.md#symbol-requireelement)
- [`branch-renderer.BranchStage`](./branch-renderer.ts.mdmd.md#symbol-branchstage)
- [`branch-renderer.createStage`](./branch-renderer.ts.mdmd.md#symbol-createstage)
- [`branch-renderer.dropStage`](./branch-renderer.ts.mdmd.md#symbol-dropstage)
- [`branch-renderer.renderBranches`](./branch-renderer.ts.mdmd.md#symbol-renderbranches)
- [`branches.BranchGraph`](./branches.ts.mdmd.md#symbol-branchgraph) (type-only)
- [`card-factory.CardContext`](./card-factory.ts.mdmd.md#symbol-cardcontext) (type-only)
- [`connections.clearConnections`](./connections.ts.mdmd.md#symbol-clearconnections)
- [`connections.drawConnections`](./connections.ts.mdmd.md#symbol-drawconnections)
- [`directory-state.NO_OPEN_DIRECTORIES`](./directory-state.ts.mdmd.md#symbol-no_open_directories)
- [`directory-state.OpenDirectories`](./directory-state.ts.mdmd.md#symbol-opendirectories)
- [`edge-signs.EdgeSigns`](./edge-signs.ts.mdmd.md#symbol-edgesigns)
- [`edge-signs.FramePlace`](./edge-signs.ts.mdmd.md#symbol-frameplace)
- [`edge-signs.createEdgeSigns`](./edge-signs.ts.mdmd.md#symbol-createedgesigns)
- [`layout-measure.Bounds`](./layout-measure.ts.mdmd.md#symbol-bounds)
- [`layout-measure.Frame`](./layout-measure.ts.mdmd.md#symbol-frame)
- [`layout-measure.LayoutExtents`](./layout-measure.ts.mdmd.md#symbol-layoutextents)
- [`layout-measure.applyContainerDimensions`](./layout-measure.ts.mdmd.md#symbol-applycontainerdimensions)
- [`layout-measure.computeFitTransform`](./layout-measure.ts.mdmd.md#symbol-computefittransform)
- [`layout-measure.computeLayoutExtents`](./layout-measure.ts.mdmd.md#symbol-computelayoutextents)
- [`layout-measure.computePathFitTransform`](./layout-measure.ts.mdmd.md#symbol-computepathfittransform)
- [`layout-measure.settleTransform`](./layout-measure.ts.mdmd.md#symbol-settletransform)
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
