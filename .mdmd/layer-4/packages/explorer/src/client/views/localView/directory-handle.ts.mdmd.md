# packages/explorer/src/client/views/localView/directory-handle.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/directory-handle.ts
- Generated At: 2026-11-15T22:47:42.357Z

## Authored
### Purpose
The arithmetic of a directory's handle in the 2D Local Map, the disclosure chevron and name that open a closed directory and close an opened one at every zoom: the height of the strip an opened directory keeps above its cards, a constant of the layout tall enough for the handle held at the farthest look's size; which of a membrane's columns keep that strip (its leading columns in one situation, by what stands above the directory there) and how far across them the handle may reach (those whose tops are level); the parts of a directory's path the handle draws (the parent's path, which is cut first, and the directory's own name, cut last); the chevron's drawing; and the size a closed box's name is held at, brought down before the name would break inside a word. The branch renderer builds the label from it, the card factory the closed box, the card reading fits the box's name with it, and the Flow shape's nominal model and the layout lab's model take the strip's height from it, so that the page and the headless command place the same picture.

### Notes
Written on 2026-11-15, after the owner found directories in the 2D map not useful when zoomed out "because there are no buttons to interact with at that distance" ([November 15, Turn 1](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-15.1.record.md#turn-1)); on November 13 they had called the far zoom "the primary place in which a user would _want_ to open a directory node". Before it, the strip was one line of the label at reading size, 30 units, so a label held at the file names' size overflowed onto the first card (the overlap reported on November 6), and the cure then was to let the label follow the map down to 6 px and drop its controls. The strip is now 60 units, a 15-unit line at the overview look's scale of 3.6 and 6 of air, whatever the label says, so the layout no longer measures the label's text. A maintainer changing a look's scale or the name's line must expect every opened directory's height to change with it, and the layout lab's captures with it.

The handle reaches across only where the strip is known to be free. In Flow every column stands from the top and keeps the strip above its first card (`branch-placement.ts`), so the handle has every leading column whose top is level with the leftmost; a column whose top steps away ends the run, because its cards stand under a strip at another height. Outside Flow the other columns' first cards stand at the padding, so the handle keeps the leftmost column. A first form kept the strip in every column standing from the top; with a nested directory open whose columns rose beside its parent's own first row, that row then stood 79 units lower than its strip asked, since standing from the top levels the first item of every column and those columns began under two strips. The root chose the strip over the handle's run alone the same day; 19 units of that gap remain, the nested membrane's padding and a lane's.

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

#### `HANDLE_STRIP` {#symbol-handle_strip}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-handle.ts#L31)

##### `HANDLE_STRIP` — Summary
The height of the strip a drawn directory keeps above its cards, a constant of the layout: a line of the handle at the
largest scale a look holds a file's name at, and the air below it. A directory's name is then never drawn smaller
than the names of the files inside it, and the held handle never lies over the first card (the overlap of 2026-11-06,
when the strip was one line at reading size, 30 units, and the label could only follow the map down to 6 px).

#### `HANDLE_INDENT` {#symbol-handle_indent}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-handle.ts#L34)

##### `HANDLE_INDENT` — Summary
The chevron and the air after it before the name, in the name's own units: what a held name's lines are indented by.

#### `CLOSED_FOOT` {#symbol-closed_foot}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-handle.ts#L37)

##### `CLOSED_FOOT` — Summary
The air a closed box's held name keeps above the box's foot, in the map's own units.

#### `CHEVRON_RIGHT` {#symbol-chevron_right}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-handle.ts#L40)

##### `CHEVRON_RIGHT` — Summary
The disclosure chevron in a 24-unit box, pointing right: pressing it opens.

#### `CHEVRON_DOWN` {#symbol-chevron_down}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-handle.ts#L42)

##### `CHEVRON_DOWN` — Summary
The disclosure chevron pointing down: pressing it closes.

#### `chevronMarkup` {#symbol-chevronmarkup}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-handle.ts#L45)

##### `chevronMarkup` — Summary
The chevron's drawing for a state, hidden from assistive technology: its button says the act.

#### `handleParts` {#symbol-handleparts}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-handle.ts#L53)

##### `handleParts` — Summary
A directory's path as its handle draws it: the directory's own name, which is cut last, and the path of its parent
before it, with its closing slash, which is drawn muted and gives way first, from its start.

#### `StripBox` {#symbol-stripbox}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-handle.ts#L59)

##### `StripBox` — Summary
What the strip's run reads of a box of the picture: its columns, its row among its siblings, and the boxes around and inside it.

#### `stripColumns` {#symbol-stripcolumns}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-handle.ts#L79)
- Parameters: `box`: [`StripBox`](#symbol-stripbox)

##### `stripColumns` — Summary
How many of a drawn directory's leading columns keep the strip for its handle: those in the same situation as its
leftmost, by what stands above the directory there. In a column it stands either below the siblings of an earlier
row that reach that column, or at its parent's top, under the parent's strip or under its padding. A column in
another situation has its top at another height, so the handle cannot reach it and it keeps only the padding: a
nested directory whose right columns rise beside its parent's own first row keeps no strip there (the root's
decision of 2026-11-15, after a strip in every column had left that row 79 units lower than its own strip asked).

#### `handleRun` {#symbol-handlerun}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-handle.ts#L99)

##### `handleRun` — Summary
The handle's room across, from the segments of its membrane that keep the strip, as placed, left to right: the run
of leading segments whose tops are level with the leftmost's, from its left edge to the run's right. A segment whose
top steps away ends the run, whatever the strip it keeps: the strip there is at another height.

#### `wholeAtSeams` {#symbol-wholeatseams}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-handle.ts#L111)
- Parameters: `header`: [`HeldHeader`](./held-lines.ts.mdmd.md#symbol-heldheader)

##### `wholeAtSeams` — Summary
Whether a held header draws the name whole and broken only at its seams.

#### `HandleFit` {#symbol-handlefit}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-handle.ts#L121)

##### `HandleFit` — Summary
A held name's scale and the header drawn at it.

#### `fitHandle` {#symbol-fithandle}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-handle.ts#L135)
- Returns: [`HeldRoom`](./held-lines.ts.mdmd.md#symbol-heldroom), [`HandleFit`](#symbol-handlefit)

##### `fitHandle` — Summary
A closed box's name fitted as a file's is: at the look's scale where the box holds it whole on lines broken at its
seams; otherwise at the largest smaller scale at which it does, never below the floor (the connections look's
scale); and at the floor, where it still does not, broken inside a word as it must and cut with an ellipsis last.
`roomAt` gives the box's room in the name's own units at a scale.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`held-lines.HeldHeader`](./held-lines.ts.mdmd.md#symbol-heldheader)
- [`held-lines.HeldRoom`](./held-lines.ts.mdmd.md#symbol-heldroom)
- [`held-lines.chooseHeldHeader`](./held-lines.ts.mdmd.md#symbol-chooseheldheader)
- [`ladder-steps.LOOK_SCALES`](./ladder-steps.ts.mdmd.md#symbol-look_scales)
<!-- LIVE-DOC:END Dependencies -->
