# `packages/explorer/src/client/views/localView/card-factory.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/explorer/src/client/views/localView/card-factory.ts`
- Generated At: 2026-11-22T07:12:55.595Z

## Authored
### Purpose
Builds the Local Map's file cards, symbol rows and closed-directory boxes, with connection anchors and separate accessible controls for inspection, retention and navigation.

### Notes

Current reading-refresh boundary, November 9 UTC: `hasCloseAction` holds the existing subject/retention/local-expansion predicate in one place for both construction and the in-place reading guard. A reading choice that changes those controls still requires a structural render; otherwise fixed-slot presentation may retain the native DOM. In the fixed-slot composition, names open the evidence reader and books control the descriptions shown on the card; growing-card names still share their books' reading choice. The November 5 description below records the earlier interaction change.

Extracted from the former `render.ts` in [December 19, Turn 04](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2025/12/Summarized/2025-12-19.2.SUMMARIZED.md#turn-04), separating card construction from scene layout. The factory receives presentation values, anchor registration and named actions through `CardContext`. Cards are rebuilt inside retained wrappers on each render; their pressed and subject appearance describes that render, while actions reach the application's current state through the controller.

A file's name and a symbol's label read what they name since [November 5](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-05/2026-11-05.1.record.md#turn-1): the tap opens or folds the description through the card context's `readNode`, and the evidence reader is behind More. The Internals endpoint, which has no description, still inspects, and the card's body has no action of its own; from October 20 to November 5 bodies and names inspected. Adjacent Pin controls change retention in one activation, with `aria-pressed` describing the explicit pin rather than merely its presence under a whole-file pin. A resolved type badge inspects the referenced file without pinning its source row. Nested controls stop the body action. The owner selected this separation in [October 19, Turn 24](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-19/2026-10-19.1.record.md#turn-24), preserving fast connection-following as the acceptance journey; [October 20, Turn 2](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-20/2026-10-20.1.record.md#turn-2) resumes its implementation.

The direct symbol Pin preserves the [October 15 retention rule](../../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#clicks-pin-what-they-name-and-the-subject-stays-where-it-is-recorded-2026-10-15): narrow a whole-file pin, add another symbol, release a symbol, and return to a whole-file pin when its last symbol is released. The file's Pin, pressed again, releases only that file's pins and keeps the subject, so a Pin undoes itself; the X is the card's close, which releases the file under the subject policy and also closes a local reveal, with interfaces required by other pins remaining visible. Centre makes a different file the subject while keeping independent pins. Its visible control originated after the [October 14 double-click investigation](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-14/Probes/pin-clicks/README.md) showed the first clicks could alter the picture before navigation.

More controls identify file, symbol and directory targets for the shared application menu. The controller supplies right-click, hold and keyboard context gestures and suppresses activation after dragging; the factory owns the native Inspect, Pin and More buttons and their accessible names. A hold is an alternative way to reveal commands, never a prerequisite for pinning.

Symbol order is the Live Doc's appearance order, alphabetical when chosen in Tuning, or the branch renderer's subsequent layout order. Public symbol rows register both interface sides; Internals registers the private-implementation input and file-level fallback, while assets use file hubs instead. These anchors remain available independently of the controls drawn beside their labels.

`createClosedDirectory` represents a closed directory as a named, counted box without symbol pins, following the [directory disclosure design](../../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#directories-open-and-close-inside-the-local-map-three-states-on-one-scale-recorded-2026-10-08). Its body and name inspect; its separate Open button discloses files and subdirectories. A directory containing a file that participates in a drawn connection is at least encasing, so no wire reaches a closed box. `countsOf` also supplies the count of contents hidden by an encasing membrane.

November 4 reading is attached through the card context after the native card is built. Canonical documentation and explicit reading choices remain owned by the separate reading surface; the factory keeps its pin actions and, since November 5, hands name taps to the reading surface; names carry aria-expanded for what is shown. See the [integration record](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-04/2026-11-04.1.record.md#turn-2).

Since [Turn 12](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-05/2026-11-05.1.record.md#turn-12--november-6) a file's name and a symbol's name carry their text in a span of their own (`local-file-name-text`, `symbol-label-text`): the card ladder scales the text, never the button, whose box fills its row and, scaled, covered the row's Pin so that a zoomed pin transition could not click it.

Since the far bands' round (2026-11-06, [Turn 3](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-06/2026-11-06.1.record.md#turn-3)) the file's name button also holds an empty, `aria-hidden` element, `local-file-name-held`, carrying the name: from the middle band out the card ladder draws the name from it, held at its reading size, in the lines the card reading chooses for each band and step in the room the header's departed lines leave. The text in the layout stays, not drawn, so that it keeps the header's height in every band and remains the name's one copy for the page's text and the perspective transition's reading of `textContent`; the button's label names the file for assistive technology. From the middle band out the page's find does not meet the name: that copy is hidden there, and the drawing is generated content, which find does not search.

Since the far bands' second milestone (2026-11-06) every card that is not an asset has a node-level hub on its using side too, at its left edge at the existing hub's height, where the overview band's gathered wires arrive; both node-level hubs are registered under `#hub` (`inbound:#hub`, `outbound:#hub`), so that the overview finds them while a file-level reference at the closer bands still arrives at Internals' dot (`inbound:*`). The using side's hub carries the class `overview-hub` since the root's fourth review (2026-11-07): the layout lab's capture had read it, as it reads every hub, as the card's `inbound:*` pin, and found 93 pins drifted on the repository's five files where the page's placement had not moved.

Since 2026-11-08 (the header round, [November 7 record, Turn 3](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-07/2026-11-07.1.record.md#turn-3) and [Turn 4](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-07/2026-11-07.1.record.md#turn-4--november-8)) the node's controls stand in the card's header after the file's name, in its focus order, rather than in the card's top right corner beside a header padded to keep them clear: the name leads on the header's first line at its full width and the controls follow it at the right edge. The name's button ends with an empty, aria-hidden room as wide and as tall as the controls (`local-file-name-room`, sized in `local.css` by the header's own count of them), its last inline box, which shares the name's last line where it fits and wraps to a line of its own where it does not; the controls stand at the header's bottom right, which is that room's line. From the middle band out the card reading places them instead, for each band and step.

Since 2026-11-13 ([the milestone after Turn 3](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-13/2026-11-13.1.record.md#turn-3)) a closed directory's box carries an aria-hidden element of its own, `.local-directory-closed__held`, which the far looks draw the box's name with, held at the look's size on the lines the card reading chooses.

The Closed Directory trial (2026-11-13) draws its three looks over the closed box's own layout, never changing its size, its controls or what they do: the stack's cards under the box, the skin with cells' field at reading size and, from `drawHeldCells`, its cells held in the far looks, and the folded membrane's label and moved controls. The owner had found the box underwhelming beside the 3D bags of cells ([Turn 7 of the November 13 record](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-13/2026-11-13.1.record.md#turn-7)).

Since 2026-11-15 ([November 15, Turn 1](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-1)) a closed directory's whole box opens it, by a click or tap anywhere on it and by Enter or Space, and its name is the handle: a button led by a disclosure chevron pointing right, which says "Open" and the directory's path, carries `aria-expanded` and keeps the keyboard. The text button "Open" is gone, and the evidence reader, which the name and the box used to open, is reached from More as Inspect directory, where a file's is; `CardContext` lost `inspectDirectory` with it. The held drawing of the far looks carries a chevron of its own before the name's lines. The owner had found directories not useful when zoomed out "because there are no buttons to interact with at that distance", and the text button was 7 px tall there or not drawn. The chevron and the strip's arithmetic are in `directory-handle.ts`. More stands on the name's line at the box's right, as on a file card (the owner's rule of November 7, that a row is never given to a lone control); an empty element keeps the row it had under the count at its size, so that the box keeps its height, and the Cells look's field now runs down through that row to the foot of the box's content.

Since 2026-11-15's second milestone ([November 15, Turn 1](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-1)) the skin with cells is the default look and the folded membrane is deleted. The skin has three shapes (`ClosedStyle`): the capsule and a card's corners are the box's own border; the folder's tab is an outline of its own, `drawTabs`, with the skin's light clipped to it, its handle lifted into the tab and More drawn moved beside the name (`placeTab`). The tab is the reading look's alone: a second, plain outline is drawn for the far looks, because a held name left room for a step in one box and none in its neighbour, a difference of form that meant nothing. `fieldMarkup` draws a directory inside as a skin, in the outer skin's shape, around cells of the one size, with its name and count as its hover text, and gives each cell the fill the 3D map gives its file's kind, the default by the owner's choice of 2026-11-16 ([Turn 8](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-8): "I _love_ the splash of color those directories provide"); the stylesheet draws one grey over it where that is the choice. A cell says its file's name on hover, the name alone, and adds no word of ours ([Turn 10](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-10): "A scan of one's software -- their own words, should do essentially all of the talking if possible"); a cell that fades under a veil names none. A veiled skin keeps its outline and fades its cells (two masks), and a small folder's tab rises 2.5 units over contents set a unit lower, so that it is seen at reading size. `drawHeldLooks` (before, `drawHeldCells`) draws the far looks' cells from the card reading's rooms.

Since 2026-11-18 ([the red case run down to its cause, after Turn 18](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#work-notes-turns-17-and-18-and-the-red-case-run-down-to-its-cause)) every handle's marks are drawn by one shared `ResizeObserver` (`observeRoom`), which reads every toolbar's room before it draws any. Each toolbar had its own observer, which read its room after the previous toolbar's drawing had dirtied the page, so the browser styled and laid out the page again once per toolbar: about 300 ms in the first frame of this repository's map with Cells under name, which held the 2D press over its bound. The marks' drawing also carries no SVG `<title>`: the buttons over the marks say the names, and the pointer never reaches the drawing. The picture is unchanged; the evidence is in [the cells-cost pictures](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Screenshots/cells-cost/README.md).

Since 2026-11-19 ([Turn 23 of the November 18 record](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-23)) the node-level hubs stand at the height of the file's name, the middle of its first line, at every look, and are drawn as large as the look's controls, no taller than a line of the name, as a row's dot is (the stylesheet: `.symbol-anchor.hub` in view-shared.css and `--hub-scale` in reading.css). The line is read from the page at render, since a name of one line shares its line with the room the node's controls keep and a longer name does not (`standHubs` in branch-renderer.ts writes `--hub-y` on the card's wrapper, by `hubLine` of [wire-gathering.ts](wire-gathering.ts.mdmd.md), which the layout lab's card model shares). The nominal card the Flow shape is priced on keeps its hub half way down: moved to the name, it changed the shape the price chooses for `scripts/live-docs` to the one Width Cost at nought gives, a change of the layout that is the owner's to choose. They had stood half way down the card at a dot's reading size at every zoom, so that in the owner's picture of the estate's cycle a line's end sat level with App.config's row `Estate.Payments.PaymentService`, a row that carries no link at all, and read as that row's pin. The placement takes a hub's drawing back as it takes a dot's (`laidOutBox` in branch-renderer.ts), so the layout reads the same pins at every look, and a growing card's hubs keep their place (reading.css).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `CardPresentation` {#symbol-cardpresentation}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/card-factory.ts#L25)

##### `CardPresentation` — Summary
The values a fresh card reads while it is built. The wrapper may survive a render, but its card is rebuilt.

#### `hasCloseAction` {#symbol-hascloseaction}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/card-factory.ts#L39)

##### `hasCloseAction` — Summary
A card can close its own retention, subject or locally expanded symbol list.

#### `CardContext` {#symbol-cardcontext}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/card-factory.ts#L44)

##### `CardContext` — Summary
Only the facts and actions a card needs; navigation targets are looked up when their event occurs.

#### `ClosedStyle` {#symbol-closedstyle}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/card-factory.ts#L68)

##### `ClosedStyle` — Summary
How a closed directory's box is drawn: Tuning's three choices for it.

#### `PIN_GLYPH` {#symbol-pin_glyph}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/card-factory.ts#L75)

##### `PIN_GLYPH` — Summary
The Pin glyph, a pushpin, in a 24-unit box: the card's Pin, a row's Pin and the card's reveal of its connections outside the view.

#### `createNodeCard` {#symbol-createnodecard}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/card-factory.ts#L90)
- Parameters: `context`: [`CardContext`](#symbol-cardcontext); `node`: [`ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload); `columnRole`: [`ColumnRole`](./types.ts.mdmd.md#symbol-columnrole)

##### `createNodeCard` — Summary
Creates a node card element for the Local Map view.

##### `createNodeCard` — Parameters
- `columnRole`: The role of the column this card belongs to
- `context`: The card's presentation inputs and live actions
- `node`: The node data to render

##### `createNodeCard` — Returns
The created card element

#### `createClosedDirectory` {#symbol-createcloseddirectory}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/card-factory.ts#L300)
- Parameters: `context`: [`CardContext`](#symbol-cardcontext); `closed`: [`ClosedDirectory`](./branches.ts.mdmd.md#symbol-closeddirectory)

##### `createClosedDirectory` — Summary
A closed directory's box: a pseudo-node with no symbols in the membrane's
style, named and counted. The whole box opens the directory (the owner,
2026-11-15: the far zoom is "the primary place in which a user would
_want_ to open a directory node", and a text button drawn at the map's
scale was 7 px tall there or not drawn): a click or tap anywhere on it, or
Enter or Space. Its name is the handle, a button led by a disclosure
chevron pointing right, as a file tree draws a folded directory, which
says the act and the directory and takes the keyboard; the evidence reader
is behind More, as a file's is. It carries no pin: a directory with a party
file under it is at least encasing, so no wire ever reaches a closed box.

#### `TAB_LIFT` {#symbol-tab_lift}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/card-factory.ts#L361)

##### `TAB_LIFT` — Summary
How far the folder's tab lifts its handle above the box's own padding, so that the name stands in the tab's middle and the body's top edge clear of the cells.

#### `drawTabs` {#symbol-drawtabs}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/card-factory.ts#L433)

##### `drawTabs` — Summary
The folder's outlines (2026-11-15). The tab is the reading look's: it rises around the handle as laid out. From the
connections look out the held name fills a box by its own measure, so that one box had room for a step beside it
and its neighbour had none, a difference of form that meant nothing; there every folder is drawn plain, the same
rounded outline without a step (the root's decision). The same outlines clip the skin's light (--tab-clip-<look>).

#### `drawHeldLooks` {#symbol-drawheldlooks}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/card-factory.ts#L468)

##### `drawHeldLooks` — Summary
The far looks' drawing of a skin with cells (2026-11-13): the cells are the look's other content beside the name, so
they are held at the look's scale as the name is, in the room the held name leaves below it, a row of them, veiled
where they end; where not a row fits, the skin alone carries the look. The card reading writes each look's room as
data-cells-<look>, "left top width height scale", the width and height in held units.

#### `HiddenCellActions` {#symbol-hiddencellactions}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/card-factory.ts#L545)

##### `HiddenCellActions` — Summary
What a handle's marks do when pressed: a file's cell pins the file, a directory's skin opens the directory.

#### `createHiddenCells` {#symbol-createhiddencells}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/card-factory.ts#L559)
- Parameters: `hidden`: [`HiddenContents`](./branches.ts.mdmd.md#symbol-hiddencontents); `style`: [`ClosedStyle`](#symbol-closedstyle); `actions`: [`HiddenCellActions`](#symbol-hiddencellactions)

##### `createHiddenCells` — Summary
What a directory drawn only around the pinned picture does not draw, as marks in its handle's line in place of the
count's words (the Hidden Files trial, 2026-11-17; the owner: "Could those be represented as cute little cells that
could be clicked on to expand them into fuller-sized nodes?"): a closed directory's own cell for each file and its
small skin for each directory, drawn by the closed look's own arithmetic and markup, as many whole marks as the line
leaves room for after the directory's name, the last fading under a veil where more are held (`lineMarks`). The line
is drawn again whenever the room the line leaves it changes, at every look, since from the connections look out the
whole line is held at the file names' size. What the marks are and do is {@link markToolbar}'s.

#### `createHiddenField` {#symbol-createhiddenfield}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/card-factory.ts#L583)
- Parameters: `hidden`: [`HiddenContents`](./branches.ts.mdmd.md#symbol-hiddencontents); `style`: [`ClosedStyle`](#symbol-closedstyle); `actions`: [`HiddenCellActions`](#symbol-hiddencellactions)

##### `createHiddenField` — Summary
The same marks under the handle's line (Hidden Files' "Cells under name", 2026-11-17, on the root's review: with the
path kept, the line at reading size held three marks of history's twenty-three), at the reading look, in the height
the handle's strip already keeps free under the line, as a closed directory's own field: `fieldBands` and `cellField`
on that room, skins first, the field's own veils. A cell that names its file and a small skin that is not faded at the
field's end are the marks pressed; a cell standing for what the room leaves out, or fading under a veil, is drawn and
names nothing. Its press reaches over the cell and half the air on each side, as wide as a pitch and as tall as a row
of the staggered pair, so that the presses of neighbouring cells do not cross. The stylesheet shows the field at the
reading look and the line's marks from the connections look out.

#### `countsOf` {#symbol-countsof}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/card-factory.ts#L733)

##### `countsOf` — Summary
"3 files, 2 directories", either part left out at zero; "empty" when both are.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`dom.setSeamedText`](../../dom.ts.mdmd.md#symbol-setseamedtext)
- [`palette.MASK_FADE`](../../palette.ts.mdmd.md#symbol-mask_fade)
- [`palette.MASK_KEEP`](../../palette.ts.mdmd.md#symbol-mask_keep)
- [`types.ClosedCellColour`](../../types.ts.mdmd.md#symbol-closedcellcolour) (type-only)
- [`types.ClosedDirectoryLook`](../../types.ts.mdmd.md#symbol-closeddirectorylook) (type-only)
- [`types.ClosedDirectoryShape`](../../types.ts.mdmd.md#symbol-closeddirectoryshape) (type-only)
- [`types.SymbolOrder`](../../types.ts.mdmd.md#symbol-symbolorder) (type-only)
- [`forceGraphAppearance.spatialKindOf`](../forceGraphAppearance.ts.mdmd.md#symbol-spatialkindof)
- [`branches.ClosedDirectory`](./branches.ts.mdmd.md#symbol-closeddirectory) (type-only)
- [`branches.HiddenContents`](./branches.ts.mdmd.md#symbol-hiddencontents) (type-only)
- [`branches.compareSymbolNames`](./branches.ts.mdmd.md#symbol-comparesymbolnames)
- [`closed-looks.CELLS`](./closed-looks.ts.mdmd.md#symbol-cells)
- [`closed-looks.Cell`](./closed-looks.ts.mdmd.md#symbol-cell) (type-only)
- [`closed-looks.CellField`](./closed-looks.ts.mdmd.md#symbol-cellfield-interface) (type-only)
- [`closed-looks.ClosedContents`](./closed-looks.ts.mdmd.md#symbol-closedcontents) (type-only)
- [`closed-looks.Rect`](./closed-looks.ts.mdmd.md#symbol-rect) (type-only)
- [`closed-looks.SHAPE_CORNER`](./closed-looks.ts.mdmd.md#symbol-shape_corner)
- [`closed-looks.Skin`](./closed-looks.ts.mdmd.md#symbol-skin) (type-only)
- [`closed-looks.cellField`](./closed-looks.ts.mdmd.md#symbol-cellfield-function)
- [`closed-looks.fieldBands`](./closed-looks.ts.mdmd.md#symbol-fieldbands)
- [`closed-looks.lineMarks`](./closed-looks.ts.mdmd.md#symbol-linemarks)
- [`closed-looks.stackEdges`](./closed-looks.ts.mdmd.md#symbol-stackedges)
- [`closed-looks.tabOutline`](./closed-looks.ts.mdmd.md#symbol-taboutline)
- [`directory-bands.parentDirectory`](./directory-bands.ts.mdmd.md#symbol-parentdirectory)
- [`directory-handle.HANDLE_LINE`](./directory-handle.ts.mdmd.md#symbol-handle_line)
- [`directory-handle.chevronMarkup`](./directory-handle.ts.mdmd.md#symbol-chevronmarkup)
- [`types.ColumnRole`](./types.ts.mdmd.md#symbol-columnrole) (type-only)
- [`wire-gathering.NODE_HUB`](./wire-gathering.ts.mdmd.md#symbol-node_hub)
- [`word-seams.countOf`](./word-seams.ts.mdmd.md#symbol-countof)
- [`types.ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
- [`types.ExplorerPublicSymbol`](../../../shared/types.ts.mdmd.md#symbol-explorerpublicsymbol) (type-only)
- [`types.ExplorerTypeReference`](../../../shared/types.ts.mdmd.md#symbol-explorertypereference) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../../../../../layer-3/architectural-decisions.mdmd.md)
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
