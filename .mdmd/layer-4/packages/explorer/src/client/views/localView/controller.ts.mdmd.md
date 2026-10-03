# packages/explorer/src/client/views/localView/controller.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/controller.ts
- Generated At: 2026-10-03T18:02:22.443Z

## Authored
### Purpose

Controller class for the Local Map. Orchestrates runtime state, rendering, the camera and Bézier connection drawing in response to selection changes, pins and the pathfinder.

### Notes

- Created 2025-12-04 during the localView modularisation; renders the columns through `render.ts` and the wires through `connections.ts`.
- The camera: `fitMapToContent` frames the selected card with its surroundings, `fitMapToPath` frames a drawn path from its first file at reading size, and both measure the map layer's own frame with its transform reset rather than the whole view. A press on a card or in the pathfinder toolbar never starts a drag, because a drag marks the camera as the person's own and no render re-fits it afterwards; toolbar clicks used to do that and left Clear unable to bring the subject back (3,846 px off, measured by the still-picture instrument, [Turn 10 of 2026-10-01](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-01.1.record.md#turn-10)). A layer observer shifts the camera, and any running animation's target, by however much the toolbar above the map grows or shrinks, so a status line is not a camera move.
- Clicking a file retains all its interfaces; clicking a symbol toggles that row's effective selection without replacing other pins. Closing a file releases its pins and reveal override; connections still needed elsewhere keep a compact card. These actions preserve the acted-on identity's screen position where it remains visible. Perspective changes use the same subject anchor; inspection and recentering retain independent branches. The earlier hover-collapse compensation remains for classic browsing.
- Explicit pathfinding saves the exploration camera and restores it on Clear, accounting for the toolbar’s changed height. `setActivePath(null)` is a no-op when no path is active; independent pins are retained throughout.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LocalViewController` {#symbol-localviewcontroller}
- Type: class
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/controller.ts#L72)
- Implements: [`LocalViewApi`](./types.ts.mdmd.md#symbol-localviewapi)

##### `LocalViewController` — Summary
Coordinates the native Local Map, independent exploration pins and explicit FROM/TO paths.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`dom.requireElement`](../../dom.ts.mdmd.md#symbol-requireelement)
- [`branches.BranchGraph`](./branches.ts.mdmd.md#symbol-branchgraph) (type-only)
- [`connections.drawConnections`](./connections.ts.mdmd.md#symbol-drawconnections)
- [`layout-measure.CenterAlignmentGuides`](./layout-measure.ts.mdmd.md#symbol-centeralignmentguides)
- [`layout-measure.LayoutExtents`](./layout-measure.ts.mdmd.md#symbol-layoutextents)
- [`layout-measure.applyColumnVerticalCentering`](./layout-measure.ts.mdmd.md#symbol-applycolumnverticalcentering)
- [`layout-measure.applyContainerDimensions`](./layout-measure.ts.mdmd.md#symbol-applycontainerdimensions)
- [`layout-measure.collectCenterAlignmentGuides`](./layout-measure.ts.mdmd.md#symbol-collectcenteralignmentguides)
- [`layout-measure.computeFitTransform`](./layout-measure.ts.mdmd.md#symbol-computefittransform)
- [`layout-measure.computeLayoutExtents`](./layout-measure.ts.mdmd.md#symbol-computelayoutextents)
- [`layout-measure.computePathFitTransform`](./layout-measure.ts.mdmd.md#symbol-computepathfittransform)
- [`layout-measure.lookupCenterAnchorPosition`](./layout-measure.ts.mdmd.md#symbol-lookupcenteranchorposition)
- [`layout-measure.withTransformReset`](./layout-measure.ts.mdmd.md#symbol-withtransformreset)
- [`pan-zoom.animateMapTransform`](./pan-zoom.ts.mdmd.md#symbol-animatemaptransform)
- [`pan-zoom.cancelInertia`](./pan-zoom.ts.mdmd.md#symbol-cancelinertia)
- [`pan-zoom.handleDragEnd`](./pan-zoom.ts.mdmd.md#symbol-handledragend)
- [`pan-zoom.handleDragMove`](./pan-zoom.ts.mdmd.md#symbol-handledragmove)
- [`pan-zoom.handleWheel`](./pan-zoom.ts.mdmd.md#symbol-handlewheel)
- [`pan-zoom.startDrag`](./pan-zoom.ts.mdmd.md#symbol-startdrag)
- [`pan-zoom.startInertia`](./pan-zoom.ts.mdmd.md#symbol-startinertia)
- [`pan-zoom.zoomByFactor`](./pan-zoom.ts.mdmd.md#symbol-zoombyfactor)
- [`render.renderLocalView`](./render.ts.mdmd.md#symbol-renderlocalview)
- [`runtime.clearAnchorRegistry`](./runtime.ts.mdmd.md#symbol-clearanchorregistry)
- [`runtime.createRuntime`](./runtime.ts.mdmd.md#symbol-createruntime)
- [`runtime.getAnchor`](./runtime.ts.mdmd.md#symbol-getanchor)
- [`runtime.getAnchorWithHop`](./runtime.ts.mdmd.md#symbol-getanchorwithhop)
- [`runtime.registerAnchor`](./runtime.ts.mdmd.md#symbol-registeranchor)
- [`runtime.registerAnchorWithHop`](./runtime.ts.mdmd.md#symbol-registeranchorwithhop)
- [`state.LocalMapState`](./state.ts.mdmd.md#symbol-localmapstate)
- [`state.PathResult`](./state.ts.mdmd.md#symbol-pathresult)
- [`state.StateStore`](./state.ts.mdmd.md#symbol-statestore)
- [`state.createInitialState`](./state.ts.mdmd.md#symbol-createinitialstate)
- [`state.createStateStore`](./state.ts.mdmd.md#symbol-createstatestore)
- [`state.setActivePath`](./state.ts.mdmd.md#symbol-setactivepath)
- [`state.setHoveredSymbol`](./state.ts.mdmd.md#symbol-sethoveredsymbol)
- [`subgraph-builder.buildPathSubgraph`](./subgraph-builder.ts.mdmd.md#symbol-buildpathsubgraph)
- [`subgraph-builder.createLocalSubgraph`](./subgraph-builder.ts.mdmd.md#symbol-createlocalsubgraph)
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
- [`pin-state.removePinsForNode`](../pin-state.ts.mdmd.md#symbol-removepinsfornode)
- [`pin-state.retainFile`](../pin-state.ts.mdmd.md#symbol-retainfile)
- [`pin-state.toggleFileSymbol`](../pin-state.ts.mdmd.md#symbol-togglefilesymbol)
- [`symbolAnchors.buildNormalizedAnchorKey`](../symbolAnchors.ts.mdmd.md#symbol-buildnormalizedanchorkey)
- [`symbolAnchors.normalizeSymbolIdentifier`](../symbolAnchors.ts.mdmd.md#symbol-normalizesymbolidentifier)
- [`symbolAnchors.tryBuildNormalizedKeyFromAnchorKey`](../symbolAnchors.ts.mdmd.md#symbol-trybuildnormalizedkeyfromanchorkey)
- [`ZoomBarrier`](../zoomBarrier.ts.mdmd.md#symbol-zoombarrier)
- [`zoomBarrier.wheelPixels`](../zoomBarrier.ts.mdmd.md#symbol-wheelpixels)
- [`types.ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->
