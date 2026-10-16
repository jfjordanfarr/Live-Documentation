# packages/explorer/src/client/views/localView/controller.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/controller.ts
- Generated At: 2026-10-15T01:42:23.640Z

## Authored
### Purpose

Controller class for the Local Map. Orchestrates runtime state, rendering, the camera and Bézier connection drawing in response to selection changes, pins and the pathfinder.

### Notes

- Created 2025-12-04 during the localView modularisation; renders the scene through `render.ts` and the wires through `connections.ts`.
- The camera: `fitMapToContent` frames the selected card with its surroundings, at reading size (the whole exploration when it fits, 2026-10-05), `fitMapToPath` frames a drawn path from its first file at reading size, and both measure the map layer's own frame with its transform reset rather than the whole view. A press on a card or in the pathfinder toolbar never starts a drag, because a drag marks the camera as the person's own and no render re-fits it afterwards; toolbar clicks used to do that and left Clear unable to bring the subject back (3,846 px off, measured by the still-picture instrument, [Turn 10 of 2026-10-01](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-01.1.record.md#turn-10)). A layer observer shifts the camera, and any running animation's target, by however much the toolbar above the map grows or shrinks, so a status line is not a camera move.
- Clicking a file retains all its interfaces; clicking a symbol presses that row (`pressSymbol`: narrow, add, release, fall back to the whole file), and nothing is pinned on the person's behalf since 2026-10-15 ([Turns 8 to 10](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-14.1.record.md#turn-8); [the decision](../../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#clicks-pin-what-they-name-and-the-subject-stays-where-it-is-recorded-2026-10-15)): `togglePinnedSymbol` had pinned the subject whole on the first pin elsewhere so that it would not vanish, which the exploration's disclosure now does without a pin. A pin never moves the subject; `updateRetainedPins` leaves it unless its own pins are released, when the newest pinned file is the subject, or there was none, when the file pinned becomes it. Closing a file releases its pins and reveal override; connections still needed elsewhere keep a compact card. These actions preserve the acted-on identity's screen position where it remains visible. Perspective changes use the same subject anchor; inspection and recentering retain independent branches. Hover dims unrelated content without rearranging the scene.
- The pan and the pinch are on pointer events since 2026-10-15, one pointer dragging and two zooming around their midpoint and panning with it, so that a finger does what a mouse does on the 2D map; the pan had listened to mouse events alone, which a touch screen's drag never sends. The viewport's `touch-action: none` keeps the browser's own gestures off it.
- Explicit pathfinding saves the exploration camera and restores it when the path is left, accounting for the report’s changed height. `retainSymbol` (2026-10-14) pins one symbol for the search bar unless it is pinned already. `setActivePath(null)` is a no-op when no path is active; independent pins are retained throughout.
- `previousTops` (2026-10-06) keeps where the last branch picture stood each card, by its top; the renderer offers that order as a start of the order step and prices a start by the pairs of cards it would swap, so a re-layout keeps the picture put unless another arrangement is clearly cheaper. `render.ts` forgets it when the branches are left.
- `stage` and `lastInteracted` (2026-10-07): the branch picture's elements kept across renders so that a change of picture moves them, and the file whose card the person last acted on (every pin change passes through `updateRetainedPins`; choosing a file counts in `render.ts`; hover counts when the `holdStill` tuning says so), which a move holds still on screen. `dropStage` ends a running move when the branches are left or the controller is disposed ([Turn 16](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-06.1.record.md#turn-16)).
- The opened directories (2026-10-08, [the decisions log](../../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#directories-open-and-close-inside-the-local-map-three-states-on-one-scale-recorded-2026-10-08)): `openDirectories` reads the set the application owns beside the pins, `openDirectory` and `closeDirectory` change the set through `updateOpenDirectories`, which keeps the directory's label or box where it was on screen as `updateRetainedPins` keeps a row, marks the directory as what was last acted on so the move holds it, and persists the exploration. The subgraph's center may be null, for a picture entered by directory.
- Pending path renders are coalesced: an explicit render cancels its queued frame, so a shared path can be resolved before first paint without drawing twice. Wheel input zooms within 2D; the application changes perspective only through explicit controls ([owner's correction](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-12.1.record.md#turn-3)).
- The render is owed, not forced (2026-10-16, [the decision](../../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#the-local-maps-work-stays-with-the-view-and-the-wires-keep-their-elements-recorded-2026-10-16)): `render()` runs only while the map is the view shown (`isShown`: the map view in its 2D perspective); asked for otherwise it is owed, and `show()`, which the application calls when the map is shown again, runs it, or, when none is owed and a picture stands, resumes the continuing search where it paused. The two guards that skipped a render in 3D went, since `render()` decides for itself, and the hold of a clicked label or row is measured only on a shown map, so a change made in 3D does not mark the 2D camera as the person's own. A `visibilitychange` resumes the search when the page is visible again. Before, the search went on behind another view and a return drew the unchanged picture again (240 ms, measured) and began the search anew.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LocalViewController` {#symbol-localviewcontroller}
- Type: class
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/controller.ts#L64)
- Implements: [`LocalViewApi`](./types.ts.mdmd.md#symbol-localviewapi)

##### `LocalViewController` — Summary
Coordinates the native Local Map, independent exploration pins and explicit FROM/TO paths.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`dom.requireElement`](../../dom.ts.mdmd.md#symbol-requireelement)
- [`branch-renderer.BranchStage`](./branch-renderer.ts.mdmd.md#symbol-branchstage)
- [`branch-renderer.dropStage`](./branch-renderer.ts.mdmd.md#symbol-dropstage)
- [`branches.BranchGraph`](./branches.ts.mdmd.md#symbol-branchgraph) (type-only)
- [`connections.drawConnections`](./connections.ts.mdmd.md#symbol-drawconnections)
- [`directory-state.NO_OPEN_DIRECTORIES`](./directory-state.ts.mdmd.md#symbol-no_open_directories)
- [`directory-state.OpenDirectories`](./directory-state.ts.mdmd.md#symbol-opendirectories)
- [`directory-state.closeDirectory`](./directory-state.ts.mdmd.md#symbol-closedirectory)
- [`directory-state.openDirectory`](./directory-state.ts.mdmd.md#symbol-opendirectory)
- [`layout-measure.LayoutExtents`](./layout-measure.ts.mdmd.md#symbol-layoutextents)
- [`layout-measure.applyContainerDimensions`](./layout-measure.ts.mdmd.md#symbol-applycontainerdimensions)
- [`layout-measure.computeFitTransform`](./layout-measure.ts.mdmd.md#symbol-computefittransform)
- [`layout-measure.computeLayoutExtents`](./layout-measure.ts.mdmd.md#symbol-computelayoutextents)
- [`layout-measure.computePathFitTransform`](./layout-measure.ts.mdmd.md#symbol-computepathfittransform)
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
- [`render.renderLocalView`](./render.ts.mdmd.md#symbol-renderlocalview)
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
- [`types.LocalSubgraph`](./types.ts.mdmd.md#symbol-localsubgraph) (type-only)
- [`types.LocalViewApi`](./types.ts.mdmd.md#symbol-localviewapi) (type-only)
- [`types.LocalViewOptions`](./types.ts.mdmd.md#symbol-localviewoptions) (type-only)
- [`types.MapTransform`](./types.ts.mdmd.md#symbol-maptransform) (type-only)
- [`pin-state.EMPTY_PIN_SET`](../pin-state.ts.mdmd.md#symbol-empty_pin_set)
- [`pin-state.PinSet`](../pin-state.ts.mdmd.md#symbol-pinset)
- [`pin-state.isSymbolPinned`](../pin-state.ts.mdmd.md#symbol-issymbolpinned)
- [`pin-state.pressSymbol`](../pin-state.ts.mdmd.md#symbol-presssymbol)
- [`pin-state.removePinsForNode`](../pin-state.ts.mdmd.md#symbol-removepinsfornode)
- [`pin-state.retainFile`](../pin-state.ts.mdmd.md#symbol-retainfile)
- [`retained-state.subjectAfterRelease`](../retained-state.ts.mdmd.md#symbol-subjectafterrelease)
- [`symbolAnchors.buildNormalizedAnchorKey`](../symbolAnchors.ts.mdmd.md#symbol-buildnormalizedanchorkey)
- [`symbolAnchors.tryBuildNormalizedKeyFromAnchorKey`](../symbolAnchors.ts.mdmd.md#symbol-trybuildnormalizedkeyfromanchorkey)
- [`types.ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->
