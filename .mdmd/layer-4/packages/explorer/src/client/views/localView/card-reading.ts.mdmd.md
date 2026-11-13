# packages/explorer/src/client/views/localView/card-reading.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/card-reading.ts
- Generated At: 2026-11-13T21:12:10.201Z

## Authored
### Purpose
Current on-map reading surface built from canonical file Purpose, exact symbol sections and recorded type references. Books open and fold descriptions in either composition; fixed-slot names open full text in the reader, while growing-card names share their books’ reading choice.

### Notes

Current reading correction, November 9 UTC, following the owner’s [additional reading feedback](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-08.1.record.md#turn-3-additional-reading-feedback-during-the-review): fixed-slot cards again expose file and exact-symbol books. They save the same application-owned choices as growing cards, including per-symbol overrides of a whole-card choice. Slots start open, and folding hides their text while reserving its space. Names keep opening the reader. Explicit reading remains independent of pins and survives share, reload, history restoration and zoom. A whole-card opening retains the existing disclosure contract, making that file’s complete symbol list available; a single-symbol fold changes only its text. The restored book’s width participates in the row’s measured control room and follows Pin through the middle band. Empty fixed slots receive no book. A book’s pressed state reports saved intent, while its expanded state reports meaningful prose actually shown at the current band; the controller synchronizes those states on band changes. Earlier paragraphs below record the comparison’s initial behavior.

The application owns deliberate reading choices; this module owns their controls, the names that share them and the text itself. A description opens and folds only by a deliberate act: `toggle` serves the book beside a description and, through the card context, the name it belongs to. A symbol's name opens its own description; the file's name opens its Purpose and every described symbol, or folds them when all are kept visible. Hover draws no text and moves nothing, the owner's verdict of [November 5](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-1): expansion on hover was "too difficult and finicky to actually work as a human end user with a computer mouse". The controller holds the card's name still while the layout grows, and focus returns to the control used. Full descriptions use the shared reader and link resolver. Missing prose is not fabricated; a card with nothing to open returns false from `toggle` so that its name can inspect instead.

Introduced during the [November 4 portrait integration](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-04.1.record.md#turn-2) with hover and keyboard-focus previews, an intent timer, dismissals and Escape; the [November 5 repair](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-04.1.record.md#turn-9) scoped requested presentation to a file or exact symbol so that overview folding could not veto a direct request. That scoping stays: the book offers Fold only when its descriptions are being kept visible, a suppressed description offers Read, an outward scale change clears scoped requests, and pans and inward zoom retain them. The previews and their machinery were removed on November 5 rather than repaired further. Keep-open intent is exposed with aria-pressed on the books; aria-expanded on books and names describes the content actually shown, including semantic zoom. Empty Summary-only records do not create a blank reading control. A file-level overflow action remains reachable when Purpose is folded.

The [November 4 learning-journey pass](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-04.1.record.md#turn-8) turns canonical outbound/inbound file counts into accessible menus near the card introduction. Choosing a file invokes ordinary subject navigation, without pinning it. The branch renderer supplies the displayed ranking's return references separately, so cycle annotations cannot be mistaken for additional graph facts. Their menu names both endpoints and navigates to the other file. A witness path from the engine’s existing breadth-first walk explains the complete file dependency cycle, including intermediate files; duplicate basenames use their paths. The transient menu closes on a structural redraw and is disposed with the reading surface.

The comparison of [November 5](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-4) added the composition the owner wanted to see beside this one, chosen by `mode()` from the options: with fixed slots no book is made, every symbol and the Purpose get a block carrying `local-reading-slot`, filled or not, never hidden, `toggle` opens the full text in the reader dialog for a described name and still returns false for a card with nothing described, `updateCard` applies `local-slot-card` instead of `local-reading-card`, and `measure` keeps the Read full description links hidden, the ellipsis saying there is more. Later that day ([Turn 6](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-6)) zoom stopped changing any box in either composition: `updatePresentation` only toggles `local-reading-faded`, and the fold's reveal exceptions and scale observation went with it. Whichever composition the owner does not choose is to be deleted, not kept as an option.

Since [Turn 11](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-11) `measureRooms`, called from `measure` for slot cards, writes the room each name may grow into below reading scale as numbers for the stylesheet: a symbol's name against its row's allotment (`--fill-scale`, the least of the width and height ratios, nine tenths of the room, never below 1), the file's name against its header down to the Purpose's slot (`--title-fill-h`, `--title-room-w`, `--title-w`) and the widths of the card's buttons (`--actions-w`, `--more-w`) that intrude on that room as they hold their size. A name's text is measured by a Range, less the map's scale and the name's own transform, because the name's box is stretched to its wrapper.

Later on [Turn 12](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-12--november-6) `measureRooms` writes two rooms a row: `--fill-middle`, up to the row's controls while they stand, and `--fill-far`, the whole row once they leave, and reads a name's own transform from its text span.

Since the breakpoint pass (2026-11-06, [Turns 17 to 19](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-17--november-6)) `measureRooms` is a module function that only reads and returns its writes, and `measure` reads every slot card before writing any, so that the page lays out once for them all rather than once a row (the November 6 cost finding, [Turn 12 of the November 5 record](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-12--november-6)). It writes a row's raw facts, `--row-h`, `--row-room-w`, `--row-name-w`, `--row-name-h`, `--row-name-top`, `--row-fill-h`, `--row-controls-w` and `--row-more-w`, in place of the two precomputed fills: the room a name has beside its row's controls now depends on the step, at which the controls are held, so the stylesheet computes it. The room by height is measured from where the name begins to the row's bottom, less the 2 px the pinned highlight keeps under it, so that a name grown downward and its highlight stay inside the row.

Since the far bands' round (2026-11-06, after the owner's report in [Turn 1](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-06.1.record.md#turn-1) and go-ahead in [Turn 3](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-06.1.record.md#turn-3) of anchor dots drawn past their cards and buttons above their rows) every held part is bounded by the room of the box it belongs to, and `measureRooms` reads only boxes the layout gave, so that a render in any band reads the same: a row's name's depth below the row's top (`--row-name-y`) and the wrapper's (`--row-wrapper-y`), from which the stylesheet holds the row's head about the row's top edge, `--row-fill-h` now the most the name may be scaled that way (the pure sums are in `ladder-rooms.ts`); its badges' width, More's place and height, which bound the row's buttons by the row; its dots' centre and height, read with the step's shift and scale undone, and their room to the card's border (`--row-dot-room`); and a `local-name-wraps` class for a name that wraps at the reading width, which the first step out does not hold. The file's name gets its room from its top to the header's right edge and down to the first row, the card's bottom and the row pitch for the overview band, and the card's buttons' overhang (`--actions-over-x`, `--actions-over-y`, `--more-h`); `--title-fill-h` and `--title-w` are gone, since the name now wraps rather than scales to fit. `markFirstPin`, also called by the branch renderer whenever it orders a card's rows, writes how many shown rows stand above the first pinned one, which bounds the file's name at the overview band. A write may now be a class as well as a property, and an empty property value removes it.

After the root's third review of the round (2026-11-06; the owner's picture of `rosetta-manifest.json` pinned whole, where the browser's own wrapping broke file names inside a word beside the node's More, "main.r / s"), `measureRooms` also chooses the held file name's lines: for every band from the middle out and every step, with Tuning's resistances from the new `resistances()` option, it gives `heldTitle` and `chooseHeldLines` (`held-lines.ts`) the rooms it measured and a canvas measure of the name's font, and writes the lines as `data-lines-<band>-<step>` on the held element, which the stylesheet draws as they are. A write whose name begins with `data-` is an attribute. The card's rooms are kept per card so that `markFirstPin` chooses the overview band's lines again when the rows are reordered without a reading. The button overhang properties are no longer written, since only the line choice reads them.

Since 2026-11-10, with Tuning's Zoom Looks set to three looks (a trial, [Turn 5 of the November 10 record](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-10.1.record.md#turn-5)), the held file name's lines are also chosen once a render for each look that draws it, the connections look in the far band's room and the overview look in the overview band's, at the look's one scale (`data-lines-look-<look>` and `--controls-y-look-<look>`), so that inside a look the name never changes its lines; and the Internals row, the card's last, is given the room down to the card's content bottom as its row height, so that its name, its More and its dot are held at the look's scale like the rows above it instead of following the map to a few pixels; the stylesheet then draws its dashed box as a layer that grows with the held head, since the wrapper's own border had run through the enlarged name. With the default steps nothing here changes.

Since 2026-11-13 ([Turn 2 of that day's record](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-13.1.record.md#turn-2), the owner's "a LOT of the actual node cards' real estate goes totally unused" and the dead Reading button), with the three looks `measureRooms` also gives a symbol's name the room below it that its description left: for each look that holds names it counts the lines the name takes at the look's scale in its room across (`heldLineCount`, `held-lines.ts`, with a canvas measure of the name's font and the card's break opportunities, `rowSegments`), at most the lines its row holds there (`nameLinesHeld`, `ladder-rooms.ts`), and writes the count as `--row-lines-<look>`, one line of the name as `--row-line`, and a `local-name-lines-<look>` class where it is more than one, from which the stylesheet draws the name wrapped. It also measures the counts at the card's foot for the connections look (`footWrites`): where the card's room below what it draws, its drawn rows or on a card with none its file's name as the look holds it, takes them at the look's scale, the card is marked `local-foot-held` with that scale and each count gets its distance above the last one's foot. `measure` first takes back those classes on every card at once, since a reading can come between renders and must read the boxes as the layout put them. At the middle band the node's controls counted for the held header leave out the book, which leaves there with the descriptions.

Later the same day a name's lines at render are counted by `linesOf` (`ladder-rooms.ts`), so that a word break's empty box, which stood a pixel off its text under Segoe UI's line metrics, no longer makes one line read as two; that had halved `--row-line` and laid a wrapped name's two lines over each other on such a font.

Later on 2026-11-13 (the milestone after [Turn 3 of that day's record](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-13.1.record.md#turn-3)) a fixed-slot symbol whose description is not shown, none written or folded, has a short row: `updateCard` marks it `local-row-short`, and `rowsChange` tells the branch renderer when the reading choices shorten or restore a row, so that the card is laid out again around the acted-on card held still rather than only redrawn. With the zoom looks `measureRooms` reads each row's head (`LookHead`) and `lookHeadWrites` places them for the far looks: each name takes the lines it needs at the connections look up to what a slot row holds there (`fitLines` when the rows cannot hold them all), the heads are spaced evenly over the rows' room (`evenRows`), and each row gets its shift (`--row-even-y`), its height (`--row-even-h`), its fill (`--row-fill-even`) and its head's height (`data-head-h`), from which `markFirstPin` finds the shifts again when the rows are reordered. A row's More is read with its shift taken back. The file's name's room at the overview is now a depth to the first pinned row (`--title-pin-depth`, and `--title-pin-depth-even` as the looks draw its head; `pinDepth`), since rows have two heights. In the looks its header is chosen by `chooseNameHeader`, which keeps a short extension from a line of its own; the ladder's headers keep their filled first line. `closedBoxWrites` gives a closed directory's box its far-look drawing: the name's lines and scale for each look, and Open and the box's More moved beside the name where the box holds them.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ReadingTarget` {#symbol-readingtarget}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/card-reading.ts#L26)

##### `ReadingTarget` — Summary
A file's Purpose or one exact symbol's description, named by the card it is read on.

#### `CardReadingOptions` {#symbol-cardreadingoptions}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/card-reading.ts#L29)

##### `CardReadingOptions` — Summary
Canonical text, application-owned choices and the actions a card's text can lead to.

#### `CardReading` {#symbol-cardreading}
- Type: class
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/card-reading.ts#L77)

##### `CardReading` — Summary
Builds on-card explanations from the same bundled docs as the full reader. A description opens and folds only
by a deliberate action, a tap on the name it belongs to or on the book beside it; hover draws no text and moves
nothing (the owner's verdict of 2026-11-05: expansion on hover was "too difficult and finicky to actually work
as a human end user with a computer mouse"). The application saves every choice, so what a person opened is
what a shared link shows. Geometry changes belong to the controller and the renderer, which hold the acted-on
name still while the card grows or shrinks around it. Zoom never changes a card's box: below reading scale the
prose fades (the owner, 2026-11-05: "I really would prefer that the cards don't themselves resize when we zoom
out"). With fixed slots every symbol keeps the same allotment of text lines; books fold or restore their text,
while names open full descriptions in the reader.

#### `markFirstPin` {#symbol-markfirstpin}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/card-reading.ts#L837)

##### `markFirstPin` — Summary
Write the pin depths for a card whose rows were just ordered, and its held name's lines at the overview band, whose
room they bound, from the card's last reading: no layout is read.
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
- [`held-lines.CONTROLS_GAP`](./held-lines.ts.mdmd.md#symbol-controls_gap)
- [`held-lines.HELD_BANDS`](./held-lines.ts.mdmd.md#symbol-held_bands)
- [`held-lines.HeldBand`](./held-lines.ts.mdmd.md#symbol-heldband)
- [`held-lines.HeldRoom`](./held-lines.ts.mdmd.md#symbol-heldroom)
- [`held-lines.TitleRooms`](./held-lines.ts.mdmd.md#symbol-titlerooms)
- [`held-lines.chooseHeldHeader`](./held-lines.ts.mdmd.md#symbol-chooseheldheader)
- [`held-lines.chooseNameHeader`](./held-lines.ts.mdmd.md#symbol-choosenameheader)
- [`held-lines.heldLineCount`](./held-lines.ts.mdmd.md#symbol-heldlinecount)
- [`held-lines.heldSegments`](./held-lines.ts.mdmd.md#symbol-heldsegments)
- [`held-lines.heldTitle`](./held-lines.ts.mdmd.md#symbol-heldtitle)
- [`held-lines.rowSegments`](./held-lines.ts.mdmd.md#symbol-rowsegments)
- [`ladder-rooms.FootCount`](./ladder-rooms.ts.mdmd.md#symbol-footcount)
- [`ladder-rooms.HEAD_SPACE`](./ladder-rooms.ts.mdmd.md#symbol-head_space)
- [`ladder-rooms.HIGHLIGHT_BELOW`](./ladder-rooms.ts.mdmd.md#symbol-highlight_below)
- [`ladder-rooms.dotRoom`](./ladder-rooms.ts.mdmd.md#symbol-dotroom)
- [`ladder-rooms.evenRows`](./ladder-rooms.ts.mdmd.md#symbol-evenrows)
- [`ladder-rooms.fitLines`](./ladder-rooms.ts.mdmd.md#symbol-fitlines)
- [`ladder-rooms.footHold`](./ladder-rooms.ts.mdmd.md#symbol-foothold)
- [`ladder-rooms.headHeight`](./ladder-rooms.ts.mdmd.md#symbol-headheight)
- [`ladder-rooms.layoutTopOf`](./ladder-rooms.ts.mdmd.md#symbol-layouttopof)
- [`ladder-rooms.linesOf`](./ladder-rooms.ts.mdmd.md#symbol-linesof)
- [`ladder-rooms.nameFill`](./ladder-rooms.ts.mdmd.md#symbol-namefill)
- [`ladder-rooms.nameLinesHeld`](./ladder-rooms.ts.mdmd.md#symbol-namelinesheld)
- [`ladder-rooms.nameWraps`](./ladder-rooms.ts.mdmd.md#symbol-namewraps)
- [`ladder-rooms.pinDepth`](./ladder-rooms.ts.mdmd.md#symbol-pindepth)
- [`ladder-steps.FIRST_STEP`](./ladder-steps.ts.mdmd.md#symbol-first_step)
- [`ladder-steps.LAST_STEP`](./ladder-steps.ts.mdmd.md#symbol-last_step)
- [`ladder-steps.LOOK_BANDS`](./ladder-steps.ts.mdmd.md#symbol-look_bands)
- [`ladder-steps.LOOK_SCALES`](./ladder-steps.ts.mdmd.md#symbol-look_scales)
- [`ladder-steps.LadderResistances`](./ladder-steps.ts.mdmd.md#symbol-ladderresistances)
- [`ladder-steps.ZoomLook`](./ladder-steps.ts.mdmd.md#symbol-zoomlook-type)
- [`ladder-steps.ladderScales`](./ladder-steps.ts.mdmd.md#symbol-ladderscales-function)
- [`types.LocalEdge`](./types.ts.mdmd.md#symbol-localedge) (type-only)
- [`types.ReadingControl`](./types.ts.mdmd.md#symbol-readingcontrol) (type-only)
- [`word-seams.seamsOf`](./word-seams.ts.mdmd.md#symbol-seamsof)
- [`types.ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->
