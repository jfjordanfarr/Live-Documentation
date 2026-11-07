# packages/explorer/src/client/views/localView/held-lines.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/held-lines.ts
- Generated At: 2026-11-06T21:39:30.408Z

## Authored
### Purpose

Chooses the lines of a file's name as the 2D Local Map's card ladder draws it from the middle band out, where the name is held at its reading size in the room the header's departed lines leave, beside the node's held buttons. Four rules decide them: a segment between the name's seams breaks only when it is wider than a full line; a name that fits whole on the lines below the buttons goes there rather than breaking beside them; a segment wider than a full line breaks at the last character that fits; and where the room runs out, the last line holds as much of the rest as fits with an ellipsis. `heldTitle` gives the room at a band and a step's held scales by the stylesheet's own formulas, which draw the result. Pure: the card reading supplies the measured rooms and a canvas measure of the name's font at render, and writes the lines as one attribute a band and step for the stylesheet to draw as they are.

### Notes

Written in the far bands' round on 2026-11-06, after the root's third review of the round (the day's [record](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-06.1.record.md), Turn 6 in the root's copy) looked at the owner's picture of `rosetta-manifest.json` pinned whole on the builder's first handback: at press 9 the file names of eleven cards broke inside a word beside the node's More ("main.r / s", "Main.c / s", "compil / er-…"). The browser had wrapped the held name itself, with `overflow-wrap: anywhere` and a float standing for the buttons, and Chromium takes that emergency break before it moves a line box past a float, so a short name broke beside the button instead of moving below it. Choosing the lines here also ended the drawing's dependence on a computed `-webkit-line-clamp`. The room formulas are duplicated from `reading.css` on purpose, since the stylesheet must still scale and place the drawing; the box audit in `tests/e2e/card-ladder-boxes.spec.ts` measures the drawn lines in the name's own font at every press and fails if a line runs past its room or under the buttons, so a drift between the two shows there. A step can meet a band beside its own for a moment at a band's edge (each has its own hysteresis), so every band is chosen for every step.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `HeldRoom` {#symbol-heldroom}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/held-lines.ts#L19)

##### `HeldRoom` — Summary
The room a held name has, in its own units (the map's divided by its scale).

#### `HeldBand` {#symbol-heldband}
- Type: type
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/held-lines.ts#L33)

##### `HeldBand` — Summary
A band that draws the held name.

#### `HELD_BANDS` {#symbol-held_bands}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/held-lines.ts#L35)

##### `HELD_BANDS` — Summary
The bands that draw the held name, from the closest out: the card reading chooses its lines for each.

#### `TitleRooms` {#symbol-titlerooms}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/held-lines.ts#L43)

##### `TitleRooms` — Summary
A card's title rooms, in the map's own units, as the card reading measures them at render and writes them for the
stylesheet (each as written, rounded alike): the room across from the name's left to the header's right edge, down to
the first row and to the card's bottom; the row pitch and gap; the node's buttons' widths, More's height and how far
the buttons stand past the header's right edge and above the name's top; and the buttons' ceiling.

#### `heldTitle` {#symbol-heldtitle}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/held-lines.ts#L67)
- Parameters: `rooms`: [`TitleRooms`](#symbol-titlerooms); `band`: [`HeldBand`](#symbol-heldband)

##### `heldTitle` — Summary
The held name's scale and room at a band and a step's held scales, by the stylesheet's own formulas (reading.css, the
file's name in the card ladder), which draw it: the name holds its step's size, never smaller than the map's own nor
larger than one line of its room's height; it takes the header's room down to the first row, or at the overview band
down to the card's first drawn row (after the rows before the first pinned by name, null for none) or its bottom;
beside it stand the node's held buttons, all three at the middle band and More alone beyond, with 4 px of air.

#### `chooseHeldLines` {#symbol-chooseheldlines}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/held-lines.ts#L91)
- Parameters: `room`: [`HeldRoom`](#symbol-heldroom)

##### `chooseHeldLines` — Summary
The lines of a name for a room, by the four rules: the name's seams' segments in order, a measure of a text's width,
and the room. Empty lines stand beside the buttons where the name starts below them.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
