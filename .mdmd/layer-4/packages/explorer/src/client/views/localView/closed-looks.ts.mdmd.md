# packages/explorer/src/client/views/localView/closed-looks.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/closed-looks.ts
- Generated At: 2026-11-14T00:01:14.979Z

## Authored
### Purpose
Current. The arithmetic behind two of the Closed Directory trial's looks for a closed directory in the 2D Local Map: where the skin with cells draws a cell for each file directly inside and a smaller skin for each subdirectory, ending in a veil where the room cannot hold them all, and how many card edges the stack shows behind its top card. Pure, so that the page and the tests read the same numbers; it takes the room the box already has and never sizes the box.

### Notes
Made on 2026-11-13 after the owner found the closed box underwhelming beside the 3D Local Map's bags of cells: it "doesn't indicate to me "this thing can pop open and let out a lot of stuff into the screen"" ([Turn 7 of the November 13 record](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-13.1.record.md#turn-7)). The field has two lanes, the count's line and the controls' row past the controls, so that no cell stands under Open or More; the cells are neutral, since blue and green mean what offers and what uses. The page draws it from `card-factory.ts`, from the box's measured layout. A trial for comparison behind Tuning, not a decision.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ClosedContents` {#symbol-closedcontents}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/closed-looks.ts#L14)

##### `ClosedContents` — Summary
What a closed directory holds, as the skin with cells draws it: its own files, and each subdirectory's own files and subdirectories.

#### `CellRoom` {#symbol-cellroom}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/closed-looks.ts#L20)

##### `CellRoom` — Summary
The room a field has, in its own units: as wide as the box's content, and the controls' corner to keep clear, if any.

#### `Band` {#symbol-band}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/closed-looks.ts#L28)

##### `Band` — Summary
A strip of the field: "pair", two staggered rows of cells, or "single", one row where the room holds no more.

#### `Cell` {#symbol-cell}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/closed-looks.ts#L31)

##### `Cell` — Summary
A round cell's centre and radius, in the field's units.

#### `Rect` {#symbol-rect}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/closed-looks.ts#L33)

##### `Rect` — Summary
A rectangle in the field's units.

#### `SubSkin` {#symbol-subskin}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/closed-looks.ts#L36)
- Extends: [`Rect`](#symbol-rect)

##### `SubSkin` — Summary
A subdirectory's own skin: its files' cells, a rim for each of its subdirectories, and whether it holds more than it shows.

#### `CellField (interface)` {#symbol-cellfield-interface}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/closed-looks.ts#L39)

##### `CellField (interface)` — Summary
What a field draws: a cell for each file shown, a skin for each subdirectory shown, and the veil where it holds more.

#### `CELLS` {#symbol-cells}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/closed-looks.ts#L53)

##### `CELLS` — Summary
A file's cell and the air between cells, a subdirectory skin's inner cell, air and padding, the most inner cells a
skin shows, the air between items and between bands, and the veil's length. Cells pack staggered, each touching its
neighbours across the same air, so that the body reads as a bag of round things rather than a grid of dots.

#### `PAIR_HEIGHT` {#symbol-pair_height}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/closed-looks.ts#L60)

##### `PAIR_HEIGHT` — Summary
The height of a band of two staggered rows of cells.

#### `SKIN_HEIGHT` {#symbol-skin_height}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/closed-looks.ts#L62)

##### `SKIN_HEIGHT` — Summary
The height of a subdirectory's skin, which stands within a two-row band.

#### `fieldBands` {#symbol-fieldbands}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/closed-looks.ts#L68)
- Returns: [`Band`](#symbol-band)[]
- Parameters: `room`: [`CellRoom`](#symbol-cellroom)

##### `fieldBands` — Summary
The bands a room holds: as many two-row bands as fit from its top, a band that reaches below the controls' top
beginning past them; where no two-row band fits, one row if that fits; none when not even a row does.

#### `cellField (function)` {#symbol-cellfield-function}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/closed-looks.ts#L85)
- Returns: [`CellField`](#symbol-cellfield-interface)
- Parameters: `contents`: [`ClosedContents`](#symbol-closedcontents)

##### `cellField (function)` — Summary
Lay a closed directory's contents into its bands, left to right and band after band: each subdirectory's skin
first, its own files' cells staggered within it and a rim for each of its subdirectories, then a cell for each file.
A skin that holds more than it shows ends in its own veil. Where the bands cannot hold everything, the last band is
filled to its end with cells and its end is veiled, so that the field never looks emptier, or as holding fewer, than
the directory is. In a one-row band a subdirectory is a rim of a cell's size.

#### `stackEdges` {#symbol-stackedges}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/closed-looks.ts#L151)

##### `stackEdges` — Summary
How many cards a stack shows under its top card, by the files under it at any depth: one, two or three.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
