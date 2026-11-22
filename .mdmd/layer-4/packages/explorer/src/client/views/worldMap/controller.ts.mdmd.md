# `packages/explorer/src/client/views/worldMap/controller.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/explorer/src/client/views/worldMap/controller.ts`
- Generated At: 2026-11-22T07:12:56.771Z

## Authored
### Purpose
The World Map, drawn. Everything that touches the DOM is here: the SVG the board is drawn into in layers (ground, the built-on layer, shadows, roads, blocks, strands, doors, labels), the tools and the crumbs, the evidence panel that peeks on hover and pins on click with every name in it a link, the help and the walkthrough, the pointer (drag to pan, right-drag or shift-drag to orbit, wheel to zoom and, past half the view, into a thing, drag a piece to move it, double-click to open it), the keys, the positions kept in the browser's storage and written back into the board text on save, and the handle at `window.__worldMap` that the tests and screenshot scripts drive. The numbers come from `projection.ts`, `layout.ts` and `model.ts`.

### Notes
- Written on 2026-09-28 ([Turn 46](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/09/Summarized/2026-09-27.1.SUMMARIZED.md#turn-46)) and reworked on the owner's first look the next day ([Turn 47](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/09/Summarized/2026-09-27.1.SUMMARIZED.md#turn-47): a click never pinned, because the SVG captured the pointer on press and the release was retargeted to the surface, so the pressed element is kept now; every name in a pinned panel became a link; the orbit's vertical direction was corrected) and on their second ([Turn 49](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/09/Summarized/2026-09-27.1.SUMMARIZED.md#turn-49): a thing opens into the Membrane Map scoped to its folder, with the World Map as the crumb above). The colours follow the owner's word of 2026-09-29, blue offers and green uses on the World Map as inside a system ([Turn 13 of the September 29 session](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/09/Summarized/2026-09-29.2.SUMMARIZED.md#turn-13)). Labels keep their size while the world scales, so `settleLabels` runs after every camera move and the design audit holds under zoom.
- At 1,700 lines this is the client's largest module: drawing, the evidence panel's words, input, tools, help and the walkthrough in one class. It was built in a day as the board probe's rendering on real data, and the owner expects the World Map to be re-imagined, "a week to a month of work"; splitting it before that would be work the re-imagining discards. On 2026-10-08 its fifteen empty doc comments, which satisfied the JSDoc lint rule and told a reader nothing, were written, and a dangling comment and a stray re-export of `NORMALS` were removed.
- Kept by `tests/e2e/world-map.spec.ts` (what is drawn and what a person can do), `world-map-design.spec.ts` (no two labels collide and nothing is cut off, in each state) and `world-map-estate.spec.ts` (the same over the estate), through the handle rather than pixels.
- Since 2026-10-10 ([Turn 12 of the October 9 session](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-09/2026-10-09.1.record.md#turn-12)) a thing's ghosts, what its files call that nothing on the board serves, are doors that use with no road: keyed `ghost:<thing>:<basis>:<name>`, on the wall facing away from the board's middle, dashed, with a short dashed stub along the wall's normal and an empty ring at its end; pinned, a ghost says who calls it, from which files and on what basis, and that pointing at the folder that serves it would make it a wire; a thing's panel lists them under "calls out to". The same day door labels were found never to have shown on hover, the stylesheet hiding them and the hover clearing only an inline style; they show now and settle like the other movable labels after every hover, with the estate's spec auditing them pinned.
- Since 2026-10-10 ([Turn 14 of the October 9 session](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-09/2026-10-09.1.record.md#turn-14)), with this repository's board re-authored as its delivery shape: an imagined thing is drawn hollow, its faces at `HOLLOW` opacity and its edges dashed, with its kind under its name and no word for its state, the owner's "visual grammar for 'proposed' elements"; a door the board declares that no road lands on is a door that offers with no road, keyed like a served one, dashed with a stub into the air, the mirror of a ghost, since a promise is never hidden; `enter` pins an imagined thing instead of returning silently; the crumbs count what the join found wanting and the help lists it, as the board command prints it; a door's label may cross to the other side of its door when no step up or down clears it, and a sub-line a door's label still covers goes; a region's name sits just outside its left point, off the feet of the things at its corners.
- Since 2026-11-12 a piece's label stands above the top of its outline (`labelAnchor`) rather than on the middle of its lid, where an outsider's first visit found every second line drawn through the piece's own edges ([finding 6](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-12/Screenshots/first-visit/README.md)). `settleLabels` keeps every label off every piece's outline as well as off the others. A piece's name moves, nearest piece first, up a line at most or sideways by up to half its width; the line under it keeps its height and may find its own place aside. Failing both, the label stands below its piece, clear of the strands, and only then does the second line go. Region names, tags, tokens and door labels settle after the names, a region's name with more room since it names an area. A label lifted further had read as the next piece's; the rules tried on the way, and an orbit sweep's counts for each, are in [the round's evidence](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-12/Screenshots/world-map-repairs/README.md). The crossing tag's own guess at where the names stood went with it.
- Also since 2026-11-12, from the same visit (findings 7, 12 and 17):
  - **The pinned panel.** A piece's panel is the piece's kind, region and folder, then what it offers, calls, is called by, calls out to, stands on and is under, then "open", then its files in a `details` folded behind their count. `evidenceFor` returns a head and a body; the head, with the close icon, is sticky in the scrolling panel. `placeEvidence` stands a pinned piece's panel, or the peek at the keyboard's piece, beside the piece with `panelBeside`. It avoids the piece's wired neighbours and its door names, and places the panel again when the files unfold. Other panels still follow the pointer.
  - **The tools.** The board's tools are `iconButton`s in three groups, named, with their key in the tooltip and `aria-keyshortcuts`; the toggles carry `aria-pressed`. The first drawings for turning, looking down and built on read as gauges, a download and a stool, and were redrawn as circular arrows, a cube with its top filled, and layers.
  - **Keyboard stops.** Each piece has a keyboard stop in a focus layer that `draw` moves in place rather than rebuilds, so focus survives a turn; they are kept in the board's order. The stops' listeners stand on the view's HTML, because Chrome made the SVG layer that held them a stop of its own. Focus peeks, Enter or Space pins and moves focus into the panel, and `unpin` returns focus to the piece when the keyboard was in its panel. Wires and doors are not stops yet.
  - **The walkthrough.** It remembers the view it began on. Each step stands on that view but for the state it shows, and `endTour` eases back to it; `orbitTo` takes the framing to end on.
  - **Door labels** start just beyond their piece's outline at their own height (`spanWithin`), since settling against outlines had flung them far from their doors.
- Since 2026-11-13, on the owner's report that the view from above came out askew after a turn by drag ([the session record](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-13/2026-11-13.1.record.md#turn-2)), `topDown` looks down at the squared azimuth nearest the camera's (`lookDown` in `projection.ts`), so the board turns the least it can and stands square to the screen after any turn by drag; it remembers the view it left in `lookedDown`, and looking up returns there unless the camera turned while above (`lookUp`). The tool shows pressed only straight above with the board squared (`looksDown`); dragged to straight above at another azimuth it shows unpressed, and pressing it squares the board where it stands, after which it looks up on an eighth turn to the resting elevation rather than back to the askew view.
- Also since 2026-11-13, on the owner's report in the same turn that turning the camera by right-drag had become very slow:
  - **The cost.** `settleLabels` had put each label back where it rests and read its box with `getBoundingClientRect`, one label after another, between attribute writes; each read laid the page out again. `draw` settled twice, from `applyCamera` and again from `applyHover`, the first result always thrown away. On this repository's board a turn's pointer move cost about 45 layouts of the page, against about 12 before the November 12 label rule and 2 since, counted over a scripted right-drag; times in the headless browser moved too much with the machine's load to be quoted here.
  - **One batch.** Settling now puts every label back where it rests, reads every resting box in one batch, so the page is laid out once, and computes every place a label might go from those boxes, as before. A door's label is measured on its other side only when its first side finds no clear place. The boxes are the browser's own because they must be: a box worked out by arithmetic from a size measured once differs from the browser's by its rounding, up to a sixty-fourth of a pixel, and at the angles where this board's rows line up with the line of sight that broke ties between places differently for 58 of 11,036 labels over 260 camera states. A label's width also differs by up to a tenth of a pixel from one zoom to another, because the browser shapes words for their scale on the screen. Over those 260 states every label now takes the move it took before.
  - **One drawing a frame.** A drag's pointer moves and the wheel's steps change the camera at once and ask for the drawing at the next animation frame (`request`); several moves between two frames are drawn once, and `pointerup` draws whatever is still waiting (`flush`), so the picture and the camera agree when the pointer lets go. The handle's calls and the keys still draw at once. An eased turn moves the pan and zoom before drawing, so each of its frames is drawn once.
  - **The panel waits.** While a drag is under way the hover does not change, so `applyHover` leaves the evidence panel as it is instead of writing and placing it again on every frame; it is placed again when the pointer lets go. A drag reads where the drawing stands on the page once, when it begins, rather than at every move.
- Since 2026-10-20 the map's keys ignore a key another surface has already used, such as the Escape that closed the reader over it, and any key typed inside a full-screen dialog, so a phone's full reader cannot toggle the theme or reset the layout behind it ([the record](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-20/2026-10-20.1.record.md#turn-7)).
- Since 2026-11-18, writing the product's design rules down as a design system, at the owner's request ([Turn 14 of the November 18 record](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-14)), found six defects here; the pictures and the cases are in [the round's evidence](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Screenshots/world-map-keyboard/README.md).
  - **The letters.** Q, E, T, F, U, G, D, R and ? had listened on the window and acted from anywhere while the World Map was the view, Ctrl held or not, inside a `<select>` too, so Ctrl+R reloaded the page and reset the layout with it (WCAG 2.2, 2.1.4 Character Key Shortcuts). They now listen on the view's own element and act only while the keyboard is inside it, never with Ctrl, Meta or Alt held and never from a field (`isField`). Escape alone stays on the window: it types nothing and it is the way out. The view's element has `tabIndex = -1`, so a press anywhere on the board that lands on nothing focusable gives it the keyboard, while a press on a tool, a link or the pinned panel keeps the focus the browser gives that; no listener moves focus.
  - **Reset, and putting back.** `resetLayout` used to throw every position away and save at once. It now keeps what it discarded in `beforeReset` until a piece is next moved (`forgetReset`, from a drop or the handle's `move`); until then the same tool and the same key put the positions back. The tool is a toggle, pressed while a reset stands that it can take back. Its name stays "Reset layout", as a toggle's name does, and its tooltip says which of the two a press will do. A reset with nothing moved does nothing. What was discarded lives for the page, not in storage.
  - **Reduced motion.** `tween` makes every change at once under `prefers-reduced-motion: reduce`, read at each change: turning, looking down and up, and the walkthrough's camera.
  - **Help and the walkthrough.** The help button carries `aria-expanded` and `aria-controls`. The walkthrough writes each step into a `role="status"` region of the view's own (`status`), kept outside the walkthrough's box, which is hidden when it ends; the page's own status region is the page template's.
  - **The pinned panel's size.** Since 2026-11-19 a resize observer places a pinned panel again whenever its size changes, its files unfolded or folded. It replaced a `toggle` listener. That event comes in a task of its own, so the unfolded panel could be read, and could be painted, where the folded one had stood, its foot below the view; `world-map.spec.ts` caught it about one run in five.
  - **The toolbar** is one Tab stop: the tool last on holds `tabIndex` 0 and the rest -1, and the arrows (wrapping), Home and End move between them, as the WAI-ARIA Authoring Practices' toolbar does.
- Since 2026-11-19 ([Turn 22 of the November 18 record](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-22)) the hover's peek waits for the pointer to rest. `lookAtRest` feeds `pointerRest.ts` what the pointer touches (`touched`) and where it stands, and `hover`, the peek's subject with its fade and door names, becomes the thing only once the pointer has rested on it; a timer looks again when the rest is due, since nothing else would, and a drag stops it: a peek arriving in the middle of a turn laid the page out again, which the estate's count of layouts a move caught. Moving onto anything else ends the peek at once. Under a pin the rest is kept but nothing is shown. Keyboard focus still peeks at once and a click still pins at once. A piece's accessible name also says the folder it opens, "opens packages/engine", in the scan's words, since every blind tester met a box whose folder nothing named until it was opened; the peek and the pinned panel already named it. [The pictures](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Screenshots/rested-pointer/README.md).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Hover` {#symbol-hover}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/controller.ts#L126)

##### `Hover` — Summary
What the pointer is on.

#### `WorldMapOptions` {#symbol-worldmapoptions}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/controller.ts#L132)

##### `WorldMapOptions` — Summary
What the controller is given: where to draw, the board and its join, the graph, and the doors out of the view.

#### `OpenedThing` {#symbol-openedthing}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/controller.ts#L161)

##### `OpenedThing` — Summary
A thing as its way down hands it to the page: its board name, its folder, and, where the question is carried, every
file that carries its wires, in the order a picture should take them.

#### `WorldMapController` {#symbol-worldmapcontroller}
- Type: class
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/controller.ts#L223)

##### `WorldMapController` — Summary
Draws a board and answers the pointer.

#### `WorldMapApi` {#symbol-worldmapapi}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/controller.ts#L2355)

##### `WorldMapApi` — Summary
The handle a test or a screenshot script drives, at `window.__worldMap`.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Board`](../../../../../engine/src/live-docs/board.ts.mdmd.md#symbol-board) (type-only)
- [`board.renderBoard`](../../../../../engine/src/live-docs/board.ts.mdmd.md#symbol-renderboard)
- [`boardGraph.Ghost`](../../../../../engine/src/live-docs/boardGraph.ts.mdmd.md#symbol-ghost) (type-only)
- [`boardGraph.ServedDoor`](../../../../../engine/src/live-docs/boardGraph.ts.mdmd.md#symbol-serveddoor) (type-only)
- [`graph.LiveDocGraph`](../../../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph) (type-only)
- [`graph-helpers.escapeHtml`](../../graph-helpers.ts.mdmd.md#symbol-escapehtml)
- [`palette.WorldForm`](../../palette.ts.mdmd.md#symbol-worldform) (type-only)
- [`palette.activePalette`](../../palette.ts.mdmd.md#symbol-activepalette)
- [`palette.mix`](../../palette.ts.mdmd.md#symbol-mix)
- [`palette.whenPaletteChanges`](../../palette.ts.mdmd.md#symbol-whenpalettechanges)
- [`icon-button.CLOSE_ICON`](../../panels/icon-button.ts.mdmd.md#symbol-close_icon)
- [`icon-button.iconButton`](../../panels/icon-button.ts.mdmd.md#symbol-iconbutton)
- [`url-state.parseInitialState`](../../persistence/url-state.ts.mdmd.md#symbol-parseinitialstate)
- [`pointerRest.NO_REST`](../pointerRest.ts.mdmd.md#symbol-no_rest)
- [`PointerRest`](../pointerRest.ts.mdmd.md#symbol-pointerrest) (type-only)
- [`pointerRest.restAt`](../pointerRest.ts.mdmd.md#symbol-restat)
- [`pointerRest.restedOn`](../pointerRest.ts.mdmd.md#symbol-restedon)
- [`pointerRest.restsAt`](../pointerRest.ts.mdmd.md#symbol-restsat)
- [`layout.Anchor`](./layout.ts.mdmd.md#symbol-anchor) (type-only)
- [`layout.Avoid`](./layout.ts.mdmd.md#symbol-avoid) (type-only)
- [`layout.FLOAT`](./layout.ts.mdmd.md#symbol-float)
- [`layout.GRID`](./layout.ts.mdmd.md#symbol-grid)
- [`layout.LabelMove`](./layout.ts.mdmd.md#symbol-labelmove) (type-only)
- [`layout.Placed`](./layout.ts.mdmd.md#symbol-placed) (type-only)
- [`layout.Rect`](./layout.ts.mdmd.md#symbol-rect) (type-only)
- [`layout.ScreenBox`](./layout.ts.mdmd.md#symbol-screenbox) (type-only)
- [`layout.Wall`](./layout.ts.mdmd.md#symbol-wall) (type-only)
- [`layout.autoPlace`](./layout.ts.mdmd.md#symbol-autoplace)
- [`layout.clamp`](./layout.ts.mdmd.md#symbol-clamp)
- [`layout.corners`](./layout.ts.mdmd.md#symbol-corners)
- [`layout.coveredArea`](./layout.ts.mdmd.md#symbol-coveredarea)
- [`layout.drawOrder`](./layout.ts.mdmd.md#symbol-draworder)
- [`layout.inRect`](./layout.ts.mdmd.md#symbol-inrect)
- [`layout.labelAnchor`](./layout.ts.mdmd.md#symbol-labelanchor)
- [`layout.labelMoves`](./layout.ts.mdmd.md#symbol-labelmoves)
- [`layout.panelBeside`](./layout.ts.mdmd.md#symbol-panelbeside)
- [`layout.pixelsToUnits`](./layout.ts.mdmd.md#symbol-pixelstounits)
- [`layout.placePiece`](./layout.ts.mdmd.md#symbol-placepiece)
- [`layout.rectAround`](./layout.ts.mdmd.md#symbol-rectaround)
- [`layout.roadCurve`](./layout.ts.mdmd.md#symbol-roadcurve)
- [`layout.silhouette`](./layout.ts.mdmd.md#symbol-silhouette)
- [`layout.spanWithin`](./layout.ts.mdmd.md#symbol-spanwithin)
- [`layout.spreadTokens`](./layout.ts.mdmd.md#symbol-spreadtokens)
- [`layout.unitsToPixels`](./layout.ts.mdmd.md#symbol-unitstopixels)
- [`layout.wallOf`](./layout.ts.mdmd.md#symbol-wallof)
- [`layout.wallPoint`](./layout.ts.mdmd.md#symbol-wallpoint)
- [`model.WorldModel`](./model.ts.mdmd.md#symbol-worldmodel) (type-only)
- [`model.WorldRoad`](./model.ts.mdmd.md#symbol-worldroad) (type-only)
- [`model.regionsOf`](./model.ts.mdmd.md#symbol-regionsof)
- [`projection.Camera`](./projection.ts.mdmd.md#symbol-camera) (type-only)
- [`projection.MIN_ELEVATION`](./projection.ts.mdmd.md#symbol-min_elevation)
- [`projection.Pivot`](./projection.ts.mdmd.md#symbol-pivot) (type-only)
- [`projection.Point2`](./projection.ts.mdmd.md#symbol-point2) (type-only)
- [`projection.Point3`](./projection.ts.mdmd.md#symbol-point3) (type-only)
- [`projection.REST_ELEVATION`](./projection.ts.mdmd.md#symbol-rest_elevation)
- [`projection.Screen`](./projection.ts.mdmd.md#symbol-screen) (type-only)
- [`projection.TOP_DOWN`](./projection.ts.mdmd.md#symbol-top_down)
- [`projection.bezierAt`](./projection.ts.mdmd.md#symbol-bezierat)
- [`projection.cuboidFaces`](./projection.ts.mdmd.md#symbol-cuboidfaces)
- [`projection.depthOf`](./projection.ts.mdmd.md#symbol-depthof)
- [`projection.fitScreen`](./projection.ts.mdmd.md#symbol-fitscreen)
- [`projection.fromScreen`](./projection.ts.mdmd.md#symbol-fromscreen)
- [`projection.lookDown`](./projection.ts.mdmd.md#symbol-lookdown)
- [`projection.lookUp`](./projection.ts.mdmd.md#symbol-lookup)
- [`projection.looksDown`](./projection.ts.mdmd.md#symbol-looksdown)
- [`projection.pointInPolygon`](./projection.ts.mdmd.md#symbol-pointinpolygon)
- [`projection.project`](./projection.ts.mdmd.md#symbol-project)
- [`projection.ring`](./projection.ts.mdmd.md#symbol-ring)
- [`projection.shade`](./projection.ts.mdmd.md#symbol-shade)
- [`projection.smooth`](./projection.ts.mdmd.md#symbol-smooth)
- [`projection.toScreen`](./projection.ts.mdmd.md#symbol-toscreen)
- [`projection.unproject`](./projection.ts.mdmd.md#symbol-unproject)
- [`projection.zoomAt`](./projection.ts.mdmd.md#symbol-zoomat)
- [`way-down.wireEndsOf`](./way-down.ts.mdmd.md#symbol-wireendsof)
- [`way-down.wireFilesOf`](./way-down.ts.mdmd.md#symbol-wirefilesof)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../../../layer-3/live-documentation-explorer.mdmd.md)
- [`.mdmd/layer-3/world-map.mdmd.md`](../../../../../../../layer-3/world-map.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
