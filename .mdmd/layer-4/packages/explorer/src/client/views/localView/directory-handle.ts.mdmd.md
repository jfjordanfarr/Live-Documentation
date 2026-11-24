# `packages/explorer/src/client/views/localView/directory-handle.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/explorer/src/client/views/localView/directory-handle.ts`
- Generated At: 2026-11-24T17:39:08.425Z

## Authored
### Purpose
The arithmetic of a directory's handle in the 2D Local Map, the disclosure chevron and name that open a closed directory and close an opened one at every zoom: the height of the strip an opened directory keeps above its cards, a constant of the layout tall enough for the handle held at the farthest look's size; which of a membrane's columns keep that strip (its leading columns in one situation, by what stands above the directory there) and how far across the membrane the handle may reach (the level columns that keep the strip, and beyond them those that hold nothing under it as placed); the parts of a directory's path the handle draws (the parent's path, which is cut first, and the directory's own name, cut last); the chevron's drawing; the size a closed box's name is held at, brought down before the name would break inside a word; and how the closed boxes of one parent are read together at a far look (`closedFamily`): each name fitted on its own, and the cells' row in every one of them or in none. The branch renderer builds the label from it, the card factory the closed box, the card reading fits the box's name with it, and the Flow shape's nominal model and the layout lab's model take the strip's height from it, so that the page and the headless command place the same picture.

### Notes
Written on 2026-11-15, after the owner found directories in the 2D map not useful when zoomed out "because there are no buttons to interact with at that distance" ([November 15, Turn 1](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-1)); on November 13 they had called the far zoom "the primary place in which a user would _want_ to open a directory node". Before it, the strip was one line of the label at reading size, 30 units, so a label held at the file names' size overflowed onto the first card (the overlap reported on November 6), and the cure then was to let the label follow the map down to 6 px and drop its controls. The strip is now 60 units, a 15-unit line at the overview look's scale of 3.6 and 6 of air, whatever the label says, so the layout no longer measures the label's text. A maintainer changing a look's scale or the name's line must expect every opened directory's height to change with it, and the layout lab's captures with it.

The handle reaches across only where the strip is known to be free. In Flow every column stands from the top and keeps the strip above its first card (`branch-placement.ts`), so the handle has every leading column whose top is level with the leftmost; a column whose top steps away ends the run, because its cards stand under a strip at another height. Outside Flow a picture is placed by its wires, its columns at the heights the wires give them and not in rows, so the strip is kept over the leftmost column alone; until 2026-11-16 the handle kept that column too, whatever stood beside it, and the estate's `PaymentService` handle read "Pay…" beside a row of its membrane that held nothing. Since then `handleReach` also takes the leading columns that are level with the leftmost and hold nothing within the strip's height of the top, read from the picture as placed ([the corrections decided on November 16](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#work-notes-the-closed-directorys-cells-and-shapes-come-back)); the layout is not asked for that room, so a card the wires place higher takes it back, and the handle's width can change from one arrangement to the next. A first form kept the strip in every column standing from the top; with a nested directory open whose columns rose beside its parent's own first row, that row then stood 79 units lower than its strip asked, since standing from the top levels the first item of every column and those columns began under two strips. The root chose the strip over the handle's run alone the same day; 19 units of that gap remain, the nested membrane's padding and a lane's.

`closedFamily` is of the same day and the same record: "a difference of form that means nothing is read as a difference of kind". Before it each closed box drew what its own name left room for, so of six siblings one showed cells, and More took a line of its own wherever a name left it none. The function has no DOM: the card reading measures each box and writes what it returns. Its first form also held every sibling's name at the tightest sibling's scale and kept More beside the name where every sibling could hold it; [the root withdrew both on the pictures](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#work-notes-the-seventh-hour-of-november-16-utc), since a family's names then stood at the floor in most families (uniform at 8 px, worse than uneven at 13), and More stood in a quarter of the families. So a name is fitted alone again (`fitHandle`), More is not drawn in a closed box at the far looks, and only the cells' row is the family's. A maintainer should know what that rule costs before changing it: one sibling whose name takes two lines, or stands at the look's full size, leaves every sibling without its cells. `HANDLE_FLOOR` is the one floor for a directory's name, a closed box's and an opened handle's alike; the stylesheet reads it as `--dir-floor`.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `HANDLE_LINE` {#symbol-handle_line}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-handle.ts#L17)

##### `HANDLE_LINE` — Summary
A line of the handle at reading size, in the map's own units: a file's name's line, whose type the handle shares.

#### `HANDLE_AIR` {#symbol-handle_air}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-handle.ts#L20)

##### `HANDLE_AIR` — Summary
The air between the held handle's foot and the first card below it, in the map's own units.

#### `HANDLE_HOLD` {#symbol-handle_hold}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-handle.ts#L23)

##### `HANDLE_HOLD` — Summary
The largest scale the strip holds the handle at: the overview look's, where a file's name is held largest.

#### `HANDLE_FLOOR` {#symbol-handle_floor}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-handle.ts#L30)

##### `HANDLE_FLOOR` — Summary
The least scale a directory's name is brought down to before it is cut, a closed box's and an opened directory's
handle's alike: the connections look's, so that no directory's name stands smaller at the farthest look than every
name stands a look closer.

#### `HANDLE_STRIP` {#symbol-handle_strip}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-handle.ts#L38)

##### `HANDLE_STRIP` — Summary
The height of the strip a drawn directory keeps above its cards, a constant of the layout: a line of the handle at the
largest scale a look holds a file's name at, and the air below it. A directory's name is then never drawn smaller
than the names of the files inside it, and the held handle never lies over the first card (the overlap of 2026-11-06,
when the strip was one line at reading size, 30 units, and the label could only follow the map down to 6 px).

#### `HANDLE_INDENT` {#symbol-handle_indent}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-handle.ts#L41)

##### `HANDLE_INDENT` — Summary
The chevron and the air after it before the name, in the name's own units: what a held name's lines are indented by.

#### `CLOSED_FOOT` {#symbol-closed_foot}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-handle.ts#L44)

##### `CLOSED_FOOT` — Summary
The air a closed box's held name keeps above the box's foot, in the map's own units.

#### `CHEVRON_RIGHT` {#symbol-chevron_right}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-handle.ts#L47)

##### `CHEVRON_RIGHT` — Summary
The disclosure chevron in a 24-unit box, pointing right: pressing it opens.

#### `CHEVRON_DOWN` {#symbol-chevron_down}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-handle.ts#L49)

##### `CHEVRON_DOWN` — Summary
The disclosure chevron pointing down: pressing it closes.

#### `chevronMarkup` {#symbol-chevronmarkup}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-handle.ts#L52)

##### `chevronMarkup` — Summary
The chevron's drawing for a state, hidden from assistive technology: its button says the act.

#### `handleParts` {#symbol-handleparts}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-handle.ts#L60)

##### `handleParts` — Summary
A directory's path as its handle draws it: the directory's own name, which is cut last, and the path of its parent
before it, with its closing slash, which is drawn muted and gives way first, from its start.

#### `fitParentPath` {#symbol-fitparentpath}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-handle.ts#L71)

##### `fitParentPath` — Summary
Fit a directory handle's parent path (e.g. `"packages/explorer/src/"`) into `available` width (in the
span's own unscaled CSS pixels) by dropping whole leading path segments (`"…/explorer/src/"`, `"…/src/"`).
Never chops mid-word (`"…odules/"`, `"…rer/"`): if even the innermost segment (`"…/<last>/"`) does not
fit, returns `""` so the directory's own name stands clean (its full path remains on hover/title).

#### `StripBox` {#symbol-stripbox}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-handle.ts#L87)

##### `StripBox` — Summary
What the strip's run reads of a box of the picture: its columns, its row among its siblings, and the boxes around and inside it.

#### `stripColumns` {#symbol-stripcolumns}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-handle.ts#L107)
- Parameters: `box`: [`StripBox`](#symbol-stripbox)

##### `stripColumns` — Summary
How many of a drawn directory's leading columns keep the strip for its handle: those in the same situation as its
leftmost, by what stands above the directory there. In a column it stands either below the siblings of an earlier
row that reach that column, or at its parent's top, under the parent's strip or under its padding. A column in
another situation has its top at another height, so the handle cannot reach it and it keeps only the padding: a
nested directory whose right columns rise beside its parent's own first row keeps no strip there (the root's
decision of 2026-11-15, after a strip in every column had left that row 79 units lower than its own strip asked).

#### `Standing` {#symbol-standing}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-handle.ts#L123)

##### `Standing` — Summary
Something standing in a membrane, as placed: a card, a closed box, or a column of a membrane or a lane inside it.

#### `handleReach` {#symbol-handlereach}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-handle.ts#L138)

##### `handleReach` — Summary
The handle's room across, from its membrane's segments as placed, left to right: from the leftmost's left edge to
the right of the last of the leading segments it reaches. It reaches a segment whose top is level with the
leftmost's and that either keeps the strip (one of the first `stripColumns`) or holds nothing of the membrane
within `clear` units of its top, the strip's height below the membrane's edge. A segment whose top steps away ends
the run, whatever it keeps: the strip there is at another height.

The second way is of 2026-11-16. A picture placed by its wires keeps the strip over a membrane's first column alone,
since its columns stand at the heights the wires give them and not in rows (`stripColumns` counts rows); there the
handle was one column wide whatever stood beside it, and "Pay…" was cut beside a row of the membrane that held
nothing. That reach is read from the picture as it stands and changes no number of the layout: a card that the
wires place higher takes the room back.

#### `wholeAtSeams` {#symbol-wholeatseams}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-handle.ts#L154)
- Parameters: `header`: [`HeldHeader`](./held-lines.ts.mdmd.md#symbol-heldheader)

##### `wholeAtSeams` — Summary
Whether a held header draws the name whole and broken only at its seams.

#### `HandleFit` {#symbol-handlefit}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-handle.ts#L164)

##### `HandleFit` — Summary
A held name's scale and the header drawn at it.

#### `fitHandle` {#symbol-fithandle}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-handle.ts#L178)
- Returns: [`HeldRoom`](./held-lines.ts.mdmd.md#symbol-heldroom), [`HandleFit`](#symbol-handlefit)

##### `fitHandle` — Summary
A closed box's name fitted as a file's is: at the look's scale where the box holds it whole on lines broken at its
seams; otherwise at the largest smaller scale at which it does, never below the floor (the connections look's
scale); and at the floor, where it still does not, broken inside a word as it must and cut with an ellipsis last.
`roomAt` gives the box's room in the name's own units at a scale.

#### `HELD_CELLS_GAP` {#symbol-held_cells_gap}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-handle.ts#L189)

##### `HELD_CELLS_GAP` — Summary
The air between a held name and the row of cells held under it, in the name's own units.

#### `ClosedRoom` {#symbol-closedroom}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-handle.ts#L192)

##### `ClosedRoom` — Summary
A closed box's room for its held name, in the map's own units, as the box is laid out.

#### `ClosedSibling` {#symbol-closedsibling}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-handle.ts#L202)

##### `ClosedSibling` — Summary
A closed box among its siblings: its name's segments, its room, and the measure of its name's type.

#### `ClosedHeld` {#symbol-closedheld}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-handle.ts#L209)

##### `ClosedHeld` — Summary
A closed box as a far look holds it: its name's own scale and lines, and the room left under the name, in the map's units.

#### `ClosedFamily (interface)` {#symbol-closedfamily-interface}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-handle.ts#L216)

##### `ClosedFamily (interface)` — Summary
A family of closed boxes at a far look: each box's own name, and whether the cells' row is drawn in them.

#### `inEverySibling` {#symbol-ineverysibling}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-handle.ts#L222)

##### `inEverySibling` — Summary
In every sibling or in none: what one box of a family draws only where each of them has the room for it.

#### `closedFamily (function)` {#symbol-closedfamily-function}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-handle.ts#L240)
- Returns: [`ClosedFamily`](#symbol-closedfamily-interface)

##### `closedFamily (function)` — Summary
The closed boxes of one parent at a far look (2026-11-16). Each box's name is fitted on its own, as a file's is
({@link fitHandle}): at the look's size where the box holds it whole, else at the largest smaller size that does,
never below the floor. More is not drawn in a closed box at these looks: the box is the control there, and More
returns at reading size (before, it took a line of its own wherever a name left it none, a row given to a lone
control). The cells' row is the family's, decided after the names are fitted: drawn in every sibling where each has
a whole row's height (`cellRow`, at its own name's scale) under its name, and otherwise in none, since a row in
some siblings and not in others said nothing but how each one's name happened to fit.

A first form of the same day also held every sibling's name at the tightest sibling's scale and kept More beside
the name where every sibling could hold it. It was withdrawn on the pictures: the names of a family then stood at
the floor in most families, the smallest names in the picture, and uniform at 8 px was worse than uneven at 13 where
a directory is the thing to act on; and More could be held in a quarter of the families only.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`held-lines.HeldHeader`](./held-lines.ts.mdmd.md#symbol-heldheader) (type-only)
- [`held-lines.HeldRoom`](./held-lines.ts.mdmd.md#symbol-heldroom) (type-only)
- [`held-lines.chooseHeldHeader`](./held-lines.ts.mdmd.md#symbol-chooseheldheader)
- [`ladder-steps.LOOK_SCALES`](./ladder-steps.ts.mdmd.md#symbol-look_scales)
<!-- LIVE-DOC:END Dependencies -->
