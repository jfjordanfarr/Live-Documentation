# packages/explorer/src/client/views/localView/card-reading.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/card-reading.ts
- Generated At: 2026-11-08T06:36:55.552Z

## Authored
### Purpose
Current on-map reading surface built from canonical file Purpose, exact symbol sections and recorded type references, opened and folded by a tap on a name or on the book beside it.

### Notes
The application owns deliberate reading choices; this module owns their controls, the names that share them and the text itself. A description opens and folds only by a deliberate act: `toggle` serves the book beside a description and, through the card context, the name it belongs to. A symbol's name opens its own description; the file's name opens its Purpose and every described symbol, or folds them when all are kept visible. Hover draws no text and moves nothing, the owner's verdict of [November 5](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-1): expansion on hover was "too difficult and finicky to actually work as a human end user with a computer mouse". The controller holds the card's name still while the layout grows, and focus returns to the control used. Full descriptions use the shared reader and link resolver. Missing prose is not fabricated; a card with nothing to open returns false from `toggle` so that its name can inspect instead.

Introduced during the [November 4 portrait integration](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-04.1.record.md#turn-2) with hover and keyboard-focus previews, an intent timer, dismissals and Escape; the [November 5 repair](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-04.1.record.md#turn-9) scoped requested presentation to a file or exact symbol so that overview folding could not veto a direct request. That scoping stays: the book offers Fold only when its descriptions are being kept visible, a suppressed description offers Read, an outward scale change clears scoped requests, and pans and inward zoom retain them. The previews and their machinery were removed on November 5 rather than repaired further. Keep-open intent is exposed with aria-pressed on the books; aria-expanded on books and names describes the content actually shown, including semantic zoom. Empty Summary-only records do not create a blank reading control. A file-level overflow action remains reachable when Purpose is folded.

The [November 4 learning-journey pass](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-04.1.record.md#turn-8) turns canonical outbound/inbound file counts into accessible menus near the card introduction. Choosing a file invokes ordinary subject navigation, without pinning it. The branch renderer supplies the displayed ranking's return references separately, so cycle annotations cannot be mistaken for additional graph facts. Their menu names both endpoints and navigates to the other file. A witness path from the engine’s existing breadth-first walk explains the complete file dependency cycle, including intermediate files; duplicate basenames use their paths. The transient menu closes on a structural redraw and is disposed with the reading surface.

The comparison of [November 5](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-4) added the composition the owner wanted to see beside this one, chosen by `mode()` from the options: with fixed slots no book is made, every symbol and the Purpose get a block carrying `local-reading-slot`, filled or not, never hidden, `toggle` opens the full text in the reader dialog for a described name and still returns false for a card with nothing described, `updateCard` applies `local-slot-card` instead of `local-reading-card`, and `measure` keeps the Read full description links hidden, the ellipsis saying there is more. Later that day ([Turn 6](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-6)) zoom stopped changing any box in either composition: `updatePresentation` only toggles `local-reading-faded`, and the fold's reveal exceptions and scale observation went with it. Whichever composition the owner does not choose is to be deleted, not kept as an option.

Since [Turn 11](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-11) `measureRooms`, called from `measure` for slot cards, writes the room each name may grow into below reading scale as numbers for the stylesheet: a symbol's name against its row's allotment (`--fill-scale`, the least of the width and height ratios, nine tenths of the room, never below 1), the file's name against its header down to the Purpose's slot (`--title-fill-h`, `--title-room-w`, `--title-w`) and the widths of the card's buttons (`--actions-w`, `--more-w`) that intrude on that room as they hold their size. A name's text is measured by a Range, less the map's scale and the name's own transform, because the name's box is stretched to its wrapper.

Later on [Turn 12](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-12--november-6) `measureRooms` writes two rooms a row: `--fill-middle`, up to the row's controls while they stand, and `--fill-far`, the whole row once they leave, and reads a name's own transform from its text span.

Since the breakpoint pass (2026-11-06, [Turns 17 to 19](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-17--november-6)) `measureRooms` is a module function that only reads and returns its writes, and `measure` reads every slot card before writing any, so that the page lays out once for them all rather than once a row (direction.md's November 6 cost finding). It writes a row's raw facts, `--row-h`, `--row-room-w`, `--row-name-w`, `--row-name-h`, `--row-name-top`, `--row-fill-h`, `--row-controls-w` and `--row-more-w`, in place of the two precomputed fills: the room a name has beside its row's controls now depends on the step, at which the controls are held, so the stylesheet computes it. The room by height is measured from where the name begins to the row's bottom, less the 2 px the pinned highlight keeps under it, so that a name grown downward and its highlight stay inside the row.

Since the far bands' round (2026-11-06, after the owner's report in [Turn 1](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-06.1.record.md#turn-1) and go-ahead in [Turn 3](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-06.1.record.md#turn-3) of anchor dots drawn past their cards and buttons above their rows) every held part is bounded by the room of the box it belongs to, and `measureRooms` reads only boxes the layout gave, so that a render in any band reads the same: a row's name's depth below the row's top (`--row-name-y`) and the wrapper's (`--row-wrapper-y`), from which the stylesheet holds the row's head about the row's top edge, `--row-fill-h` now the most the name may be scaled that way (the pure sums are in `ladder-rooms.ts`); its badges' width, More's place and height, which bound the row's buttons by the row; its dots' centre and height, read with the step's shift and scale undone, and their room to the card's border (`--row-dot-room`); and a `local-name-wraps` class for a name that wraps at the reading width, which the first step out does not hold. The file's name gets its room from its top to the header's right edge and down to the first row, the card's bottom and the row pitch for the overview band, and the card's buttons' overhang (`--actions-over-x`, `--actions-over-y`, `--more-h`); `--title-fill-h` and `--title-w` are gone, since the name now wraps rather than scales to fit. `markFirstPin`, also called by the branch renderer whenever it orders a card's rows, writes how many shown rows stand above the first pinned one, which bounds the file's name at the overview band. A write may now be a class as well as a property, and an empty property value removes it.

After the root's third review of the round (2026-11-06; the owner's picture of `rosetta-manifest.json` pinned whole, where the browser's own wrapping broke file names inside a word beside the node's More, "main.r / s"), `measureRooms` also chooses the held file name's lines: for every band from the middle out and every step, with Tuning's resistances from the new `resistances()` option, it gives `heldTitle` and `chooseHeldLines` (`held-lines.ts`) the rooms it measured and a canvas measure of the name's font, and writes the lines as `data-lines-<band>-<step>` on the held element, which the stylesheet draws as they are. A write whose name begins with `data-` is an attribute. The card's rooms are kept per card so that `markFirstPin` chooses the overview band's lines again when the rows are reordered without a reading. The button overhang properties are no longer written, since only the line choice reads them.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ReadingTarget` {#symbol-readingtarget}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/card-reading.ts#L25)

##### `ReadingTarget` — Summary
A file's Purpose or one exact symbol's description, named by the card it is read on.

#### `CardReadingOptions` {#symbol-cardreadingoptions}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/card-reading.ts#L28)

##### `CardReadingOptions` — Summary
Canonical text, application-owned choices and the actions a card's text can lead to.

#### `CardReading` {#symbol-cardreading}
- Type: class
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/card-reading.ts#L72)

##### `CardReading` — Summary
Builds on-card explanations from the same bundled docs as the full reader. A description opens and folds only
by a deliberate action, a tap on the name it belongs to or on the book beside it; hover draws no text and moves
nothing (the owner's verdict of 2026-11-05: expansion on hover was "too difficult and finicky to actually work
as a human end user with a computer mouse"). The application saves every choice, so what a person opened is
what a shared link shows. Geometry changes belong to the controller and the renderer, which hold the acted-on
name still while the card grows or shrinks around it. Zoom never changes a card's box: below reading scale the
prose fades (the owner, 2026-11-05: "I really would prefer that the cards don't themselves resize when we zoom
out"). With fixed slots, the comparison composition, every symbol has the same allotment of text lines.

#### `markFirstPin` {#symbol-markfirstpin}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/card-reading.ts#L589)

##### `markFirstPin` — Summary
Write {@link firstPinWrite} for a card whose rows were just ordered, and its held name's lines at the overview band,
whose room it bounds, from the card's last reading: no layout is read.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`document.TypeRef`](../../../../../engine/src/live-docs/document.ts.mdmd.md#symbol-typeref) (type-only)
- [`graph.GraphFile`](../../../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-graphfile) (type-only)
- [`pathfind.pathTo`](../../../../../engine/src/live-docs/pathfind.ts.mdmd.md#symbol-pathto)
- [`pathfind.walk`](../../../../../engine/src/live-docs/pathfind.ts.mdmd.md#symbol-walk-function)
- [`graph-helpers.escapeHtml`](../../graph-helpers.ts.mdmd.md#symbol-escapehtml)
- [`markdown.renderMarkdown`](../../markdown.ts.mdmd.md#symbol-rendermarkdown)
- [`item-menu.createItemMenu`](../../panels/item-menu.ts.mdmd.md#symbol-createitemmenu)
- [`reader-links.ReaderLinkContext`](../../reader-links.ts.mdmd.md#symbol-readerlinkcontext)
- [`reader-links.createReaderLinkHandler`](../../reader-links.ts.mdmd.md#symbol-createreaderlinkhandler)
- [`reader-sections.authoredSections`](../../reader-sections.ts.mdmd.md#symbol-authoredsections)
- [`reading-state.ReadingChoice`](../../reading-state.ts.mdmd.md#symbol-readingchoice)
- [`reading-state.descriptionIsOpen`](../../reading-state.ts.mdmd.md#symbol-descriptionisopen)
- [`types.InspectionTarget`](../../types.ts.mdmd.md#symbol-inspectiontarget) (type-only)
- [`held-lines.HELD_BANDS`](./held-lines.ts.mdmd.md#symbol-held_bands)
- [`held-lines.HeldBand`](./held-lines.ts.mdmd.md#symbol-heldband)
- [`held-lines.TitleRooms`](./held-lines.ts.mdmd.md#symbol-titlerooms)
- [`held-lines.chooseHeldHeader`](./held-lines.ts.mdmd.md#symbol-chooseheldheader)
- [`held-lines.heldSegments`](./held-lines.ts.mdmd.md#symbol-heldsegments)
- [`held-lines.heldTitle`](./held-lines.ts.mdmd.md#symbol-heldtitle)
- [`ladder-rooms.dotRoom`](./ladder-rooms.ts.mdmd.md#symbol-dotroom)
- [`ladder-rooms.layoutTopOf`](./ladder-rooms.ts.mdmd.md#symbol-layouttopof)
- [`ladder-rooms.nameFill`](./ladder-rooms.ts.mdmd.md#symbol-namefill)
- [`ladder-rooms.nameWraps`](./ladder-rooms.ts.mdmd.md#symbol-namewraps)
- [`ladder-rooms.rowsBeforeFirstPin`](./ladder-rooms.ts.mdmd.md#symbol-rowsbeforefirstpin)
- [`ladder-steps.FIRST_STEP`](./ladder-steps.ts.mdmd.md#symbol-first_step)
- [`ladder-steps.LAST_STEP`](./ladder-steps.ts.mdmd.md#symbol-last_step)
- [`ladder-steps.LadderResistances`](./ladder-steps.ts.mdmd.md#symbol-ladderresistances)
- [`ladder-steps.ladderScales`](./ladder-steps.ts.mdmd.md#symbol-ladderscales-function)
- [`types.LocalEdge`](./types.ts.mdmd.md#symbol-localedge) (type-only)
- [`types.ReadingControl`](./types.ts.mdmd.md#symbol-readingcontrol) (type-only)
- [`types.ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->
