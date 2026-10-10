# packages/explorer/src/client/views/worldMap/controller.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/worldMap/controller.ts
- Generated At: 2026-10-10T17:19:03.721Z

## Authored
### Purpose
The World Map, drawn. Everything that touches the DOM is here: the SVG the board is drawn into in layers (ground, the built-on layer, shadows, roads, blocks, strands, doors, labels), the tools and the crumbs, the evidence panel that peeks on hover and pins on click with every name in it a link, the help and the walkthrough, the pointer (drag to pan, right-drag or shift-drag to orbit, wheel to zoom and, past half the view, into a thing, drag a piece to move it, double-click to open it), the keys, the positions kept in the browser's storage and written back into the board text on save, and the handle at `window.__worldMap` that the tests and screenshot scripts drive. The numbers come from `projection.ts`, `layout.ts` and `model.ts`.

### Notes
- Written on 2026-09-28 ([Turn 46](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/09/Summarized/2026-09-27.1.SUMMARIZED.md#turn-46)) and reworked on the owner's first look the next day ([Turn 47](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/09/Summarized/2026-09-27.1.SUMMARIZED.md#turn-47): a click never pinned, because the SVG captured the pointer on press and the release was retargeted to the surface, so the pressed element is kept now; every name in a pinned panel became a link; the orbit's vertical direction was corrected) and on their second ([Turn 49](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/09/Summarized/2026-09-27.1.SUMMARIZED.md#turn-49): a thing opens into the Membrane Map scoped to its folder, with the World Map as the crumb above). The colours follow the owner's word of 2026-09-29, blue offers and green uses on the World Map as inside a system ([Turn 13 of the September 29 session](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/09/Summarized/2026-09-29.2.SUMMARIZED.md#turn-13)). Labels keep their size while the world scales, so `settleLabels` runs after every camera move and the design audit holds under zoom.
- At 1,700 lines this is the client's largest module: drawing, the evidence panel's words, input, tools, help and the walkthrough in one class. It was built in a day as the board probe's rendering on real data, and the owner expects the World Map to be re-imagined, "a week to a month of work"; splitting it before that would be work the re-imagining discards. On 2026-10-08 its fifteen empty doc comments, which satisfied the JSDoc lint rule and told a reader nothing, were written, and a dangling comment and a stray re-export of `NORMALS` were removed.
- Kept by `tests/e2e/world-map.spec.ts` (what is drawn and what a person can do), `world-map-design.spec.ts` (no two labels collide and nothing is cut off, in each state) and `world-map-estate.spec.ts` (the same over the estate), through the handle rather than pixels.
- Since 2026-10-10 ([Turn 12 of the October 9 session](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-09.1.record.md#turn-12)) a thing's ghosts, what its files call that nothing on the board serves, are doors that use with no road: keyed `ghost:<thing>:<basis>:<name>`, on the wall facing away from the board's middle, dashed, with a short dashed stub along the wall's normal and an empty ring at its end; pinned, a ghost says who calls it, from which files and on what basis, and that pointing at the folder that serves it would make it a wire; a thing's panel lists them under "calls out to". The same day door labels were found never to have shown on hover, the stylesheet hiding them and the hover clearing only an inline style; they show now and settle like the other movable labels after every hover, with the estate's spec auditing them pinned.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Hover` {#symbol-hover}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/controller.ts#L66)

##### `Hover` — Summary
What the pointer is on.

#### `WorldMapOptions` {#symbol-worldmapoptions}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/controller.ts#L72)

##### `WorldMapOptions` — Summary
What the controller is given: where to draw, the board and its join, the graph, and the doors out of the view.

#### `WorldMapController` {#symbol-worldmapcontroller}
- Type: class
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/controller.ts#L144)

##### `WorldMapController` — Summary
Draws a board and answers the pointer.

#### `WorldMapApi` {#symbol-worldmapapi}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/controller.ts#L1646)

##### `WorldMapApi` — Summary
The handle a test or a screenshot script drives, at `window.__worldMap`.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Board`](../../../../../engine/src/live-docs/board.ts.mdmd.md#symbol-board)
- [`board.renderBoard`](../../../../../engine/src/live-docs/board.ts.mdmd.md#symbol-renderboard)
- [`boardGraph.Ghost`](../../../../../engine/src/live-docs/boardGraph.ts.mdmd.md#symbol-ghost) (type-only)
- [`graph.LiveDocGraph`](../../../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph) (type-only)
- [`graph-helpers.escapeHtml`](../../graph-helpers.ts.mdmd.md#symbol-escapehtml)
- [`layout.Anchor`](./layout.ts.mdmd.md#symbol-anchor)
- [`layout.FLOAT`](./layout.ts.mdmd.md#symbol-float)
- [`layout.GRID`](./layout.ts.mdmd.md#symbol-grid)
- [`layout.Placed`](./layout.ts.mdmd.md#symbol-placed)
- [`layout.Rect`](./layout.ts.mdmd.md#symbol-rect)
- [`layout.Wall`](./layout.ts.mdmd.md#symbol-wall)
- [`layout.autoPlace`](./layout.ts.mdmd.md#symbol-autoplace)
- [`layout.clamp`](./layout.ts.mdmd.md#symbol-clamp)
- [`layout.corners`](./layout.ts.mdmd.md#symbol-corners)
- [`layout.drawOrder`](./layout.ts.mdmd.md#symbol-draworder)
- [`layout.inRect`](./layout.ts.mdmd.md#symbol-inrect)
- [`layout.pixelsToUnits`](./layout.ts.mdmd.md#symbol-pixelstounits)
- [`layout.placePiece`](./layout.ts.mdmd.md#symbol-placepiece)
- [`layout.rectAround`](./layout.ts.mdmd.md#symbol-rectaround)
- [`layout.roadCurve`](./layout.ts.mdmd.md#symbol-roadcurve)
- [`layout.spreadTokens`](./layout.ts.mdmd.md#symbol-spreadtokens)
- [`layout.unitsToPixels`](./layout.ts.mdmd.md#symbol-unitstopixels)
- [`layout.wallOf`](./layout.ts.mdmd.md#symbol-wallof)
- [`layout.wallPoint`](./layout.ts.mdmd.md#symbol-wallpoint)
- [`model.Tint`](./model.ts.mdmd.md#symbol-tint)
- [`model.WorldModel`](./model.ts.mdmd.md#symbol-worldmodel)
- [`model.WorldRoad`](./model.ts.mdmd.md#symbol-worldroad)
- [`model.regionsOf`](./model.ts.mdmd.md#symbol-regionsof)
- [`projection.Camera`](./projection.ts.mdmd.md#symbol-camera)
- [`projection.MIN_ELEVATION`](./projection.ts.mdmd.md#symbol-min_elevation)
- [`projection.Pivot`](./projection.ts.mdmd.md#symbol-pivot)
- [`projection.Point2`](./projection.ts.mdmd.md#symbol-point2)
- [`projection.Point3`](./projection.ts.mdmd.md#symbol-point3)
- [`projection.REST_ELEVATION`](./projection.ts.mdmd.md#symbol-rest_elevation)
- [`projection.Screen`](./projection.ts.mdmd.md#symbol-screen)
- [`projection.TOP_DOWN`](./projection.ts.mdmd.md#symbol-top_down)
- [`projection.bezierAt`](./projection.ts.mdmd.md#symbol-bezierat)
- [`projection.cuboidFaces`](./projection.ts.mdmd.md#symbol-cuboidfaces)
- [`projection.depthOf`](./projection.ts.mdmd.md#symbol-depthof)
- [`projection.fitScreen`](./projection.ts.mdmd.md#symbol-fitscreen)
- [`projection.fromScreen`](./projection.ts.mdmd.md#symbol-fromscreen)
- [`projection.isTopDown`](./projection.ts.mdmd.md#symbol-istopdown)
- [`projection.pointInPolygon`](./projection.ts.mdmd.md#symbol-pointinpolygon)
- [`projection.project`](./projection.ts.mdmd.md#symbol-project)
- [`projection.ring`](./projection.ts.mdmd.md#symbol-ring)
- [`projection.shade`](./projection.ts.mdmd.md#symbol-shade)
- [`projection.smooth`](./projection.ts.mdmd.md#symbol-smooth)
- [`projection.toScreen`](./projection.ts.mdmd.md#symbol-toscreen)
- [`projection.unproject`](./projection.ts.mdmd.md#symbol-unproject)
- [`projection.zoomAt`](./projection.ts.mdmd.md#symbol-zoomat)
<!-- LIVE-DOC:END Dependencies -->
