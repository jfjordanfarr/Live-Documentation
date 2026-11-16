# packages/explorer/src/client/views/localView/ladder-rooms.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/ladder-rooms.ts
- Generated At: 2026-11-16T04:49:21.024Z

## Authored
### Purpose

The sums the card ladder makes of a slot card's measured boxes, so that every held part of the 2D Local Map's cards stays within the box it belongs to: how far a symbol's name may be scaled about its row's top before it or its highlight leaves the row, whether a name wraps at the reading width, how far an anchor dot may grow before it crosses its card's border, where a shifted and scaled dot was laid out, how many shown rows stand above a card's first pinned one, how many lines of a name its row holds at a held scale, and whether the counts at a card's foot stand at a held scale. Pure; the card reading measures the boxes at render and writes these as custom properties, and the stylesheet turns them into held sizes at each step.

### Notes

Written in the far bands' round (2026-11-06), after the owner reported "things exceeding boundaries at very distant zoom-outs" ([Turn 1](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-06.1.record.md#turn-1)) and "elements overlapping/clipping through at extreme zooms" with a go-ahead ([Turn 3](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-06.1.record.md#turn-3)), and the root's [far-zoom review](../../../../../../../../AI-Agent-Workspace/Screenshots/2026-11-06/far-zoom-review/README.md) measured 158 of 195 dots drawn past their card's edge and dots and row buttons above their rows. The principle it serves: inside a box that never changes, a held thing is bounded by the room of the box it belongs to, and where that room runs out it follows the map. The row's head is held about the row's top edge rather than each part about its own centre, which had lifted dots and buttons above the row; `nameFill` therefore bounds a name by the depth of its bottom below that edge, the pinned highlight's 2 px of air included. A dot grows outward from its edge beside the name, the owner's rule of [November 6, Turn 17](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-17--november-6), so `dotRoom` measures from that edge to the card's border on its side; on the review's cards that allows about twice the reading size. `layoutTopOf` exists because a dot is drawn shifted onto its name's line at a step, and the measurement at render must read where the layout put it in whichever band the map shows. `rowsBeforeFirstPin` lets the file's name wrap over the overview band's silent rows only as far as the first row still drawn; the branch renderer recounts whenever it orders a card's rows, since the background search reorders rows without measuring.

`nameLinesHeld` (2026-11-13, [Turn 2 of that day's record](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-13.1.record.md#turn-2)) is `nameFill`'s count in lines: how many lines of a name held about its row's top at a scale end inside the row with the highlight's air. In a two-line slot's row, 66 px with the name's 12 px line from 2.5 px down, the connections look's 2.2 holds two and the overview look's 3.6 one; the zoom looks let a name the room across cannot hold take that many. `footHold`, of the same day, decides whether "+N symbols" and the framed "+N connections" stand at the connections look's scale, held together about the last one's foot: only where all of them fit between what the card draws above them and their foot, and across the card's content; otherwise none is drawn, so that they are never left at the map's own size, five pixels tall five presses out.

`linesOf`, of the same day, counts a text's lines from its fragments for the card reading: the empty boxes of the name's word breaks are left out and fragments whose centres lie within half a line of each other share a line. Counting rounded tops had read one line as two under Segoe UI's line metrics, where a word break's box stood a pixel off its text's, and a wrapped name was then drawn with half its line.

Later the same day, with short rows ([the milestone after Turn 3](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-13.1.record.md#turn-3)): `shortRowHeight` (44 at the connections look's 2.2, which the stylesheet states and a unit test holds it to), `headHeight`, `fitLines` and `evenRows`, which space the far looks' heads evenly over the rows' room with one more gap shared so that rows of one height move nothing, and `pinDepth`, the room to the first pinned row as laid out or as the looks draw its head, which replaced a count of rows times one pitch.

`fitKept` (2026-11-13) serves the Descriptions Zoomed Out trial. It decides which rows keep their description's first line in the connections look, and gives kept lines up before any name gives up a line, so that no name is cut to make way for a description ([Turn 7 of the November 13 record](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-13.1.record.md#turn-7)).

Since 2026-11-15 ([Turn 1 of the November 15 record](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-15.1.record.md#turn-1)) `fitKept` serves only the "first-line" value of Descriptions Zoomed Out; in the two values where every described row keeps its line the card reading keeps them all and lets `fitLines` take lines from the names instead. `fileLineRoom` says whether a file's header holds a line of its Purpose under the held name at the look's scale, with `FILE_KEPT_AIR` between them, and by how much it falls short where it does not, so that the shortfall is reported and no line is drawn smaller.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `HIGHLIGHT_BELOW` {#symbol-highlight_below}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/ladder-rooms.ts#L11)

##### `HIGHLIGHT_BELOW` — Summary
The air a pinned row's highlight keeps below its name, inside the row.

#### `nameFill` {#symbol-namefill}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/ladder-rooms.ts#L18)

##### `nameFill` — Summary
The most a symbol's name may be scaled about its row's top edge, so that the name and the highlight beneath it stay
inside the row: the row's height less the highlight's air, over the depth of the name's bottom below the row's top.
A name that already reaches the row's bottom may not grow; it is never asked to shrink (1 at least).

#### `nameLinesHeld` {#symbol-namelinesheld}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/ladder-rooms.ts#L30)

##### `nameLinesHeld` — Summary
How many lines of a symbol's name its row holds at a held scale (2026-11-13: in the zoom looks a name the room across
cannot hold takes the room its description left, the owner's "space that the symbols themselves should be able to take
up" of 2026-11-05): the name is held about the row's top edge, so its lines end at the name's top plus that many lines,
times the scale, and the last must end with the highlight's air inside the row. One at least: a name is never erased.

#### `ROW_MORE` {#symbol-row_more}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/ladder-rooms.ts#L36)

##### `ROW_MORE` — Summary
A row's More, 17 px square (local.css).

#### `NAME_LINE` {#symbol-name_line}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/ladder-rooms.ts#L38)

##### `NAME_LINE` — Summary
A symbol name's line, 1.15 of its 11 px (reading.css, the slot card's stated line).

#### `HEAD_SPACE` {#symbol-head_space}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/ladder-rooms.ts#L44)

##### `HEAD_SPACE` — Summary
The least space between one row's head and the next's in the far looks: a pinned row's highlight stands 2 px above its
head and ends 2 px below it, so that two highlights keep this less 2 of clear air between them.

#### `shortRowHeight` {#symbol-shortrowheight}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/ladder-rooms.ts#L52)

##### `shortRowHeight` — Summary
A short row's height at a held scale (2026-11-13): a symbol whose description is not shown keeps only the room its head
needs at the connections look, its More held at that scale beside one line of its name (centred on More, as the row
lays them out), with the highlight's air and the space before the next head, in whole pixels. The stylesheet states
the result for the look's 2.2.

#### `FootCount` {#symbol-footcount}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/ladder-rooms.ts#L57)

##### `FootCount` — Summary
A count at a card's foot as laid out, in the map's own units on one vertical axis: its top, bottom, left and width.

#### `footHold` {#symbol-foothold}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/ladder-rooms.ts#L71)

##### `footHold` — Summary
Whether the counts at a card's foot stand at a held scale (2026-11-13, the connections look), and each one's distance
above the last one's foot, about which they are held together, so that each is lifted by that distance times the
scale's growth and stays above the one below it. They stand only where all of them fit at that scale between the top
of the room left free above them and their foot, with `frame` of each count's frame above the first and `gap` of air
under what stands above, and across between each one's left and the card's content right; otherwise none is held.

#### `FragmentBox` {#symbol-fragmentbox}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/ladder-rooms.ts#L81)

##### `FragmentBox` — Summary
A text fragment's box as the page gives it, for counting lines.

#### `linesOf` {#symbol-linesof}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/ladder-rooms.ts#L93)

##### `linesOf` — Summary
How many lines a text's fragments stand on (2026-11-13): the empty boxes of its word breaks (`<wbr>`) left out, and two
fragments on one line when their centres lie within half the shortest fragment's height of each other. Counting each
rounded top as a line had read one line as two where a font's metrics put a word break's box a pixel off its text's
(Segoe UI's line, emulated, on 2026-11-13), which halved the line a wrapped name was drawn with.

#### `nameWraps` {#symbol-namewraps}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/ladder-rooms.ts#L108)

##### `nameWraps` — Summary
Whether a symbol's name wraps at the reading width, read in whichever band the map shows: across more than one line
where it may wrap, or wider than its button where it is held on one line and cut. A wrapped name is not held in the
reading band, since holding it would mean cutting lines and moving its description.

#### `DotSpan` {#symbol-dotspan}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/ladder-rooms.ts#L113)

##### `DotSpan` — Summary
An anchor dot's layout box across its card and the inner edges of the card it may not cross, in one unit.

#### `dotRoom` {#symbol-dotroom}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/ladder-rooms.ts#L124)
- Parameters: `dot`: [`DotSpan`](#symbol-dotspan)

##### `dotRoom` — Summary
The most an anchor dot may be scaled before it crosses its card's inner edge: a use-dot grows leftward from its edge
beside the name and an offer-dot rightward, as wires enter on the left and leave on the right, so the room is from
that edge to the card's edge on its side, over the dot's width. A dot with no room follows the map (1).

#### `layoutTopOf` {#symbol-layouttopof}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/ladder-rooms.ts#L135)

##### `layoutTopOf` — Summary
The layout top of an element drawn with `translateY(shift) scale(scale)` about its vertical centre, from the top it is
drawn at: the measurement at render reads the box the layout gave, whatever the step drew.

#### `RowMark` {#symbol-rowmark}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/ladder-rooms.ts#L140)

##### `RowMark` — Summary
A symbol row as the title's room sees it: whether it is laid out at all, whether it is pinned, and its height.

#### `rowsBeforeFirstPin` {#symbol-rowsbeforefirstpin}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/ladder-rooms.ts#L155)

##### `rowsBeforeFirstPin` — Summary
How many shown rows stand above a card's first pinned row, in the rows' order, or null when no shown row is pinned:
at the overview band the file's name may wrap down over the silent rows only as far as the first row still drawn.

#### `pinDepth` {#symbol-pindepth}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/ladder-rooms.ts#L171)

##### `pinDepth` — Summary
How far below the rows' top the first pinned shown row's top stands, less the row gap, or null when none is: the room
the file's name may take at the overview below the header's (2026-11-13: since rows have two heights, a count of rows
times one pitch no longer finds it). As laid out, or with the rows' heads shared evenly ({@link evenRows}), as the
zoom looks draw them.

#### `HeadBand` {#symbol-headband}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/ladder-rooms.ts#L190)

##### `HeadBand` — Summary
A drawn row's band as laid out, its top and its height, and its head's height in the far looks, in one unit.

#### `evenRows` {#symbol-evenrows}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/ladder-rooms.ts#L205)

##### `evenRows` — Summary
The rows' heads spaced evenly over their card's row room in the far looks (2026-11-13): with short rows beside slot
rows a card's names would stand at uneven gaps with nothing visible to explain them. Each drawn row's head, as tall
as its name's lines and its controls need there, follows the one above with the same space after it: the room the
rows' boxes span with one more gap, less their heads, shared out, so that rows of one height move nothing. A name on
two lines takes two lines and the gap after every name is the same. Each head is shifted by `shift` from its row's
top, and holds its name and controls in `height`, its own and the space after it less the gap. The rows' boxes do not
move.

#### `fitLines` {#symbol-fitlines}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/ladder-rooms.ts#L222)

##### `fitLines` — Summary
How many lines each drawn row's name takes in the far looks: as many as it wants, until the heads they make are taller
than the rows' room; then one fewer at a time, from the name that takes the most (the later of equals), down to one.

#### `fitKept` {#symbol-fitkept}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/ladder-rooms.ts#L241)

##### `fitKept` — Summary
The Descriptions Zoomed Out trial's heads in the connections look (2026-11-13): which rows keep their description's
first line under the name, and each name's lines. A row may keep it when its description is shown at reading size and
its name takes one line; the kept line is part of its head (`head(index, lines, kept)`). Kept lines give way before
any name does: while the heads are taller than the rows' room, the last row's kept line goes first, and only when none
is left do the names give up lines, as {@link fitLines} has them do. So no name is cut to make way for a description.

#### `headHeight` {#symbol-headheight}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/ladder-rooms.ts#L256)

##### `headHeight` — Summary
A row's head's height in the far looks at a held scale: the taller of its More, held at the scale from its top, and
its name's lines, held about the row's top, with the highlight's air.

#### `FILE_KEPT_AIR` {#symbol-file_kept_air}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/ladder-rooms.ts#L261)

##### `FILE_KEPT_AIR` — Summary
The air a file's kept line keeps below the held name and its controls, in the map's own units.

#### `fileLineRoom` {#symbol-filelineroom}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/ladder-rooms.ts#L269)

##### `fileLineRoom` — Summary
Whether the header holds the file's own kept line in the connections look (Descriptions Zoomed Out, 2026-11-15), and
by how much it falls short where it does not: the line is a name's line (`NAME_LINE`) at the held scale, with its air
above it, and its room is what the header keeps down to the first row (`headRoom`) below the held name and its
controls (`below`). The line is never drawn smaller to fit.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
