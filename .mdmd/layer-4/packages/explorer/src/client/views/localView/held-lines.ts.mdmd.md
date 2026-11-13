# packages/explorer/src/client/views/localView/held-lines.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/held-lines.ts
- Generated At: 2026-11-13T21:12:10.767Z

## Authored
### Purpose

Chooses the card's header from the middle band out of the 2D Local Map's card ladder: the lines the file's name is drawn on, held at its reading size, and where the node's held controls stand after it. Six principles govern it (stated in the module's comment): the name leads on the header's first line; it stands whole on the fewest lines, each filled, broken at its seams (`heldSegments`: the seams of `word-seams.ts`, and before a short extension's dot), and is cut with an ellipsis only when the room's lines run out; the controls follow it at the header's right edge, on its last line when its text leaves them room, else on the line after; More is held no taller than a line of the name from the far band out, and at the middle band the three controls' line is as tall as they are; no line is empty and nothing shrinks; and it changes only at a step. `heldTitle` gives the name's scale, the controls' scale and the room at a band and a step's held scales by the stylesheet's own formulas; `chooseHeldHeader` gives the lines and the controls' line, whether they share it, and their top. Pure: the card reading supplies the measured rooms and a canvas measure of the name's font at render, and writes the lines as an attribute and the controls' top as a custom property a band and step, which the stylesheet draws as they are.

### Notes

Written in the far bands' round on 2026-11-06, after the root's third review of the round (the day's [record](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-06.1.record.md), Turn 6 in the root's copy) looked at the owner's picture of `rosetta-manifest.json` pinned whole on the builder's first handback: at press 9 the file names of eleven cards broke inside a word beside the node's More ("main.r / s", "Main.c / s", "compil / er-…"). The browser had wrapped the held name itself, with `overflow-wrap: anywhere` and a float standing for the buttons, and Chromium takes that emergency break before it moves a line box past a float, so a short name broke beside the button instead of moving below it. Choosing the lines here also ended the drawing's dependence on a computed `-webkit-line-clamp`. The room formulas are duplicated from `reading.css` on purpose, since the stylesheet must still scale and place the drawing; the box audit in `tests/e2e/card-ladder-boxes.spec.ts` measures the drawn lines in the name's own font at every press and fails if a line runs past its room or under the buttons, so a drift between the two shows there. A step can meet a band beside its own for a moment at a band's edge (each has its own hysteresis), so every band is chosen for every step.

Until 2026-11-07 the name could take several lines, by four rules (a segment between the name's seams broken only when wider than a full line, a name that fit whole below the buttons moved there, a segment wider than a line broken inside, the last line kept ending with an ellipsis). The owner, looking at `symbolAnchors.ts` alone, found that "the choice to allow up to 2 lines of text on the card titles at certain breakpoints has caused rather silly clunky layouts at certain zoom distances" ([November 6 record, Turn 8](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-06.1.record.md#turn-8)): at the far band the node's held More stood about one and a half lines of the name tall in a header room of two lines, so no line below the button was free and the rules broke "branch- / renderer.ts" and "symbol- / highlight.ts" beside it. One line is the root's decision of November 7, reversible by the owner; the alternative pictured for the owner then, a held More no taller than one line of the name, is in [the one-line names evidence](../../../../../../../../AI-Agent-Workspace/Screenshots/2026-11-07/one-line-names/README.md).

Since 2026-11-08 (the header round) the module chooses the whole header, not the name's lines alone. The one line of November 7 had cut names alike at the overview band (five cards of the test-suite picture read "local-map-…"); the owner handed the choice back with a bar, more lines only under principles that make the header whole and never "one upper-left corner button" with "a naked zone to its left, leaving the card title underneath" ([November 7 record, Turn 3](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-07.1.record.md#turn-3)), and cleared the round under the six principles the root stated ([Turn 4](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-07.1.record.md#turn-4--november-8)). The flow is the four rules' of November 6 at the header's full width, the controls no longer standing in the name's first lines but after its last. The split before a short extension's dot gives "branch-renderer" / ".ts" beside More at the far step, where the seams alone gave "branch-" / "renderer.ts": the price of a filled first line, which the root named to the owner. `TitleRooms` lost the controls' overhang past the header's edge and above the name, since the controls now stand in the header at its right edge (`card-factory.ts`).

Since 2026-11-13 ([Turn 2 of that day's record](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-13.1.record.md#turn-2)) the module also counts a symbol's name's lines for the zoom looks, where a name the room across cannot hold takes the room its description left: `rowSegments` gives the card's own break opportunities (the seams, where `setSeamedText` puts them, and after a space) and `heldLineCount` how many lines the name takes at a width, at most those its row holds. The symbol's name is drawn by the browser's own wrapping, not by chosen lines as the file's name is, so that its text stays the page's to find and announce; the count therefore follows the browser's rule rather than `flow`'s: a segment that does not fit what is left of a line starts the next, and only one wider than a whole line is broken inside. The count sets the height of the box the name is drawn in.

`chooseNameHeader` (2026-11-13, [the milestone after Turn 3](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-13.1.record.md#turn-3)) keeps a file's name from leaving a short extension alone on its last line where the name's seams without that split carry it in no more lines, controls included, breaking only at seams and cutting nothing more ("enforce- / documentation- / links.ts", "Payment / Service.cs"). It reverses for the zoom looks, on the root's call, the November 8 acceptance of "branch-renderer / .ts" as the price of a filled first line; the card reading chooses the ladder's headers as before, with every line filled, which the ladder's box audit holds. `heldTitle` now takes the depth to the first pinned row, since rows have two heights.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `HeldRoom` {#symbol-heldroom}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/held-lines.ts#L29)

##### `HeldRoom` — Summary
The room a held header has, in the name's own units (the map's divided by the name's held scale).

#### `HeldControls` {#symbol-heldcontrols}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/held-lines.ts#L44)

##### `HeldControls` — Summary
Where the held controls stand: the line of the header they are on, whether the name shares it, and their top.

#### `HeldHeader` {#symbol-heldheader}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/held-lines.ts#L54)

##### `HeldHeader` — Summary
A held header: the name's lines, every one drawn, and the controls' place.

#### `heldSegments` {#symbol-heldsegments}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/held-lines.ts#L68)

##### `heldSegments` — Summary
A held name's segments: its seams (`word-seams.ts`), and also before a short extension's dot, which the seams keep with
the word before it so that an extension never stands alone in a wrapping box. In a held header the controls share the
name's last line, so ".ts" beside More fills the line above it: "branch-renderer" / ".ts", where the seams alone
break "branch-" / "renderer.ts" and leave the first line half empty (the header round, 2026-11-08: the price of a
filled first line, as the root told the owner).

#### `HeldBand` {#symbol-heldband}
- Type: type
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/held-lines.ts#L77)

##### `HeldBand` — Summary
A band that draws the held name.

#### `HELD_BANDS` {#symbol-held_bands}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/held-lines.ts#L79)

##### `HELD_BANDS` — Summary
The bands that draw the held name, from the closest out: the card reading chooses its header for each.

#### `CONTROLS_GAP` {#symbol-controls_gap}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/held-lines.ts#L82)

##### `CONTROLS_GAP` — Summary
The air between the name's text and the controls on a shared line, in the map's own units.

#### `TitleRooms` {#symbol-titlerooms}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/held-lines.ts#L90)

##### `TitleRooms` — Summary
A card's title rooms, in the map's own units, as the card reading measures them at render and writes them for the
stylesheet (each as written, rounded alike): the room across from the name's left to the header's right edge, down to
the first row and to the card's bottom; the node's controls' widths and More's height as laid out; and the controls'
ceiling.

#### `heldTitle` {#symbol-heldtitle}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/held-lines.ts#L111)
- Parameters: `rooms`: [`TitleRooms`](#symbol-titlerooms); `band`: [`HeldBand`](#symbol-heldband)

##### `heldTitle` — Summary
The held header's scale, its controls' scale and its room at a band and a step's held scales, by the stylesheet's own
formulas (reading.css, the file's name in the card ladder), which draw it. The name holds its step's size, never smaller
than the map's own nor larger than one line of its room's height; it takes the header's room down to the first row, or
at the overview band down to the card's first drawn row (`pinDepth` below the header's room, `ladder-rooms.ts`'s
pinDepth, null for none) or its bottom. The controls hold their step's size below their ceiling: all available controls
at the middle band, More alone beyond, where it is held no taller than a line of the name (principle 4).

#### `chooseHeldHeader` {#symbol-chooseheldheader}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/held-lines.ts#L138)
- Returns: [`HeldHeader`](#symbol-heldheader)
- Parameters: `room`: [`HeldRoom`](#symbol-heldroom)

##### `chooseHeldHeader` — Summary
The header for a room, by the six principles: the name's seams' segments in order, a measure of a text's width, and
the room. The name flows at the full width; the controls share its last line when they fit beside it, else take the
line after; when that runs past the room's height, the name keeps as many lines as the room holds with the controls
sharing the last, which is cut with an ellipsis.

#### `rowSegments` {#symbol-rowsegments}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/held-lines.ts#L168)

##### `rowSegments` — Summary
A symbol's name's segments where its row lets it wrap (2026-11-13, the zoom looks): its seams, where the card puts a
line break opportunity (`setSeamedText`), and after each space, where the browser breaks anyway ("PaymentsContext
(class)"). Unlike {@link heldSegments} a short extension keeps its dot: a row has no control to stand beside it.

#### `heldLineCount` {#symbol-heldlinecount}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/held-lines.ts#L179)

##### `heldLineCount` — Summary
How many lines a wrapping symbol name takes at a width, at most `most`, as the browser draws it with the card's break
opportunities and `overflow-wrap: break-word` (the stylesheet's zoom looks): whole before cut, each line filled before
the next, a segment that does not fit what is left of a line starting the next, and only a segment wider than a whole
line broken inside, at each line's end. A space at a line's end hangs, as the browser lets it. The count sets the box
the name is drawn in, so that the box is as tall as the lines drawn.

#### `chooseNameHeader` {#symbol-choosenameheader}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/held-lines.ts#L206)
- Returns: [`HeldHeader`](#symbol-heldheader)
- Parameters: `room`: [`HeldRoom`](#symbol-heldroom)

##### `chooseNameHeader` — Summary
A file's name's header ({@link chooseHeldHeader}) without its extension standing alone on its last line where the same
room carries it with the segment before it (2026-11-13): the split before a short extension's dot fills a first line
beside More ("branch-renderer" / ".ts"), but where the name takes three lines it left ".ts" alone on the third
("enforce- / documentation-links / .ts") when "enforce- / documentation- / links.ts" takes no more. The name's seams
without that split are taken when they use no more lines, controls included, and cut nothing the split did not.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`word-seams.seamsOf`](./word-seams.ts.mdmd.md#symbol-seamsof)
<!-- LIVE-DOC:END Dependencies -->
