# packages/explorer/src/client/views/localView/closed-looks.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/closed-looks.ts
- Generated At: 2026-11-17T04:51:11.158Z

## Authored
### Purpose
Current. The arithmetic behind two of the Closed Directory trial's looks for a closed directory in the 2D Local Map: where the skin with cells draws a cell for each file directly inside and a smaller skin for each subdirectory, ending in a veil where the room cannot hold them all, and how many card edges the stack shows behind its top card. Pure, so that the page and the tests read the same numbers; it takes the room the box already has and never sizes the box.

### Notes
Made on 2026-11-13 after the owner found the closed box underwhelming beside the 3D Local Map's bags of cells: it "doesn't indicate to me "this thing can pop open and let out a lot of stuff into the screen"" ([Turn 7 of the November 13 record](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-13.1.record.md#turn-7)). The field has two lanes, the count's line and the controls' row past the controls, so that no cell stands under Open or More; the cells are neutral, since blue and green mean what offers and what uses. The page draws it from `card-factory.ts`, from the box's measured layout. A trial for comparison behind Tuning, not a decision.

On 2026-11-15 ([November 15, Turn 1](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-15.1.record.md#turn-1)) the owner chose the cells among the trial's looks and could not read the smaller marks a directory inside was drawn as ("likely folders in folders"). Since then every cell is one size: a directory inside is a skin around a row of its own files' cells, and in a band of two rows a skin may hold the skins of the directories inside it; the micro-dots and the rims are gone, and a row no taller than a cell shows cells and a veil rather than a smaller skin. A cell carries its file's kind, for its colour, and since 2026-11-16 ([Turn 10](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-15.1.record.md#turn-10)) its file's name, which it says on hover; a cell under a veil, or one that stands for what the room left out, carries none. A veil says whether it is a skin's or the field's own (`Veil.of`), since a veiled skin keeps its outline. The field no longer keeps a corner clear for controls, More standing on the name's line. `tabOutline` draws the folder's silhouette for the Tab shape, and a small folder for a skin inside.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ClosedFile` {#symbol-closedfile}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/closed-looks.ts#L23)

##### `ClosedFile` — Summary
A file as a cell stands for it: its own name, which the cell says on hover, its kind (its archetype, as the 3D map
colours a file), and its marble's two shares (2026-11-17), which tint the cell where the marbles are drawn.

#### `CellMarble` {#symbol-cellmarble}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/closed-looks.ts#L26)

##### `CellMarble` — Summary
A marble's two shares as a cell carries them: the offering blue's and the using green's.

#### `ClosedContents` {#symbol-closedcontents}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/closed-looks.ts#L29)

##### `ClosedContents` — Summary
What a directory holds, as the skin with cells draws it: each file directly in it, and each directory inside.

#### `NestedContents` {#symbol-nestedcontents}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/closed-looks.ts#L36)
- Extends: [`ClosedContents`](#symbol-closedcontents)

##### `NestedContents` — Summary
A directory inside a closed one: its name, what it holds directly, and how many files stand under it at any depth.

#### `CellRoom` {#symbol-cellroom}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/closed-looks.ts#L42)

##### `CellRoom` — Summary
The room a field has, in its own units.

#### `Band` {#symbol-band}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/closed-looks.ts#L51)

##### `Band` — Summary
A strip of the field: "pair", as tall as a skin that holds skins, where loose cells stand in two staggered rows;
or "single", one row, as tall as a skin around cells where the room holds that, else as tall as a cell.

#### `Cell` {#symbol-cell}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/closed-looks.ts#L57)

##### `Cell` — Summary
A round cell's centre and radius, in the field's units, the kind of the file it stands for, and that file's name
where it stands for one file wholly shown: a cell under a veil, or one that stands for what the room left out, has none.

#### `Rect` {#symbol-rect}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/closed-looks.ts#L59)

##### `Rect` — Summary
A rectangle in the field's units.

#### `Skin` {#symbol-skin}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/closed-looks.ts#L62)
- Extends: [`Rect`](#symbol-rect)

##### `Skin` — Summary
A directory inside, drawn: its skin, its own files' cells, the skins of the directories inside it, and what it says of itself.

#### `Veil` {#symbol-veil}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/closed-looks.ts#L75)
- Extends: [`Rect`](#symbol-rect)

##### `Veil` — Summary
A veil: where more is held than shown, at the right end of a skin that holds more than it shows or of the field's last band.

#### `CellField (interface)` {#symbol-cellfield-interface}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/closed-looks.ts#L78)

##### `CellField (interface)` — Summary
What a field draws: a cell for each file shown, a skin for each directory inside shown, and a veil wherever more is held than shown.

#### `CELLS` {#symbol-cells}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/closed-looks.ts#L90)

##### `CELLS` — Summary
A file's cell and the air between cells; a skin's padding around what it holds; the most cells a skin inside shows,
and one inside that; the most skins a skin shows inside it; the air between items and between bands; and the veil's
length. Loose cells pack staggered, each touching its neighbours across the same air, so that the body reads as a
bag of round things rather than a grid of dots; a skin's own cells stand in one row.

#### `PAIR_HEIGHT` {#symbol-pair_height}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/closed-looks.ts#L95)

##### `PAIR_HEIGHT` — Summary
The height of two staggered rows of cells.

#### `SKIN_HEIGHT` {#symbol-skin_height}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/closed-looks.ts#L97)

##### `SKIN_HEIGHT` — Summary
The height of a skin around a row of cells.

#### `BAND_HEIGHT` {#symbol-band_height}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/closed-looks.ts#L99)

##### `BAND_HEIGHT` — Summary
The height of a skin that holds skins, and so of a band of two rows.

#### `fieldBands` {#symbol-fieldbands}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/closed-looks.ts#L105)
- Returns: [`Band`](#symbol-band)[]
- Parameters: `room`: [`CellRoom`](#symbol-cellroom)

##### `fieldBands` — Summary
The bands a room holds: as many two-row bands as fit from its top; where none fits, one row, as tall as a skin
around cells if the room holds that, else as tall as a cell, in the room's middle; none when not even a cell fits.

#### `cellField (function)` {#symbol-cellfield-function}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/closed-looks.ts#L174)
- Returns: [`CellField`](#symbol-cellfield-interface)
- Parameters: `contents`: [`ClosedContents`](#symbol-closedcontents)

##### `cellField (function)` — Summary
Lay a closed directory's contents into its bands, left to right and band after band: a skin for each directory
inside first, then a cell for each file. In a two-row band a skin holds the skins of the directories inside it and
its own files' cells; in a one-row band as tall as a skin it holds its own cells alone; a row no taller than a cell
holds no skin. Where the bands cannot hold everything, the last band is filled to its end with the cells of what was
left out and its end is veiled, so that the field never looks as holding fewer than the directory does. A cell
names its file; one that fades under a veil, or stands for what was left out, names none.

#### `SHAPE_CORNER` {#symbol-shape_corner}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/closed-looks.ts#L244)

##### `SHAPE_CORNER` — Summary
Each shape's corner, in the map's units: the capsule's, a file card's, and between the two for the folder.

#### `tabOutline` {#symbol-taboutline}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/closed-looks.ts#L253)

##### `tabOutline` — Summary
A folder's outline as path data, in a box `width` by `height` from its top left: a tab over the first `tab.width`
units, whose top is the box's own, and the body's top edge `tab.rise` lower to the right of it, with corners of
`radius` and the inner corner under the tab's right edge turned the other way. The outline stands `inset` inside the
box all round, for a stroke that stays within it. Where the tab would leave the body's top edge shorter than two
corners, there is no step to draw and the outline is the box's rounded rectangle.

#### `stackEdges` {#symbol-stackedges}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/closed-looks.ts#L267)

##### `stackEdges` — Summary
How many cards a stack shows under its top card, by the files under it at any depth: one, two or three.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.ClosedDirectoryShape`](../../types.ts.mdmd.md#symbol-closeddirectoryshape) (type-only)
<!-- LIVE-DOC:END Dependencies -->
