# packages/explorer/src/client/views/localView/ladder-rooms.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/ladder-rooms.ts
- Generated At: 2026-11-06T18:00:01.178Z

## Authored
### Purpose

The sums the card ladder makes of a slot card's measured boxes, so that every held part of the 2D Local Map's cards stays within the box it belongs to: how far a symbol's name may be scaled about its row's top before it or its highlight leaves the row, whether a name wraps at the reading width, how far an anchor dot may grow before it crosses its card's border, where a shifted and scaled dot was laid out, and how many shown rows stand above a card's first pinned one. Pure; the card reading measures the boxes at render and writes these as custom properties, and the stylesheet turns them into held sizes at each step.

### Notes

Written in the far bands' round (2026-11-06), after the owner reported "things exceeding boundaries at very distant zoom-outs" ([Turn 1](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-06.1.record.md#turn-1)) and "elements overlapping/clipping through at extreme zooms" with a go-ahead ([Turn 3](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-06.1.record.md#turn-3)), and the root's [far-zoom review](../../../../../../../../AI-Agent-Workspace/Screenshots/2026-11-06/far-zoom-review/README.md) measured 158 of 195 dots drawn past their card's edge and dots and row buttons above their rows. The principle it serves: inside a box that never changes, a held thing is bounded by the room of the box it belongs to, and where that room runs out it follows the map. The row's head is held about the row's top edge rather than each part about its own centre, which had lifted dots and buttons above the row; `nameFill` therefore bounds a name by the depth of its bottom below that edge, the pinned highlight's 2 px of air included. A dot grows outward from its edge beside the name, the owner's rule of [November 6, Turn 17](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-17--november-6), so `dotRoom` measures from that edge to the card's border on its side; on the review's cards that allows about twice the reading size. `layoutTopOf` exists because a dot is drawn shifted onto its name's line at a step, and the measurement at render must read where the layout put it in whichever band the map shows. `rowsBeforeFirstPin` lets the file's name wrap over the overview band's silent rows only as far as the first row still drawn; the branch renderer recounts whenever it orders a card's rows, since the background search reorders rows without measuring.

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

#### `nameWraps` {#symbol-namewraps}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/ladder-rooms.ts#L29)

##### `nameWraps` — Summary
Whether a symbol's name wraps at the reading width, read in whichever band the map shows: across more than one line
where it may wrap, or wider than its button where it is held on one line and cut. A wrapped name is not held in the
reading band, since holding it would mean cutting lines and moving its description.

#### `DotSpan` {#symbol-dotspan}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/ladder-rooms.ts#L34)

##### `DotSpan` — Summary
An anchor dot's layout box across its card and the inner edges of the card it may not cross, in one unit.

#### `dotRoom` {#symbol-dotroom}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/ladder-rooms.ts#L45)
- Parameters: `dot`: [`DotSpan`](#symbol-dotspan)

##### `dotRoom` — Summary
The most an anchor dot may be scaled before it crosses its card's inner edge: a use-dot grows leftward from its edge
beside the name and an offer-dot rightward, as wires enter on the left and leave on the right, so the room is from
that edge to the card's edge on its side, over the dot's width. A dot with no room follows the map (1).

#### `layoutTopOf` {#symbol-layouttopof}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/ladder-rooms.ts#L56)

##### `layoutTopOf` — Summary
The layout top of an element drawn with `translateY(shift) scale(scale)` about its vertical centre, from the top it is
drawn at: the measurement at render reads the box the layout gave, whatever the step drew.

#### `RowMark` {#symbol-rowmark}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/ladder-rooms.ts#L61)

##### `RowMark` — Summary
A symbol row as the title's room sees it: whether it is laid out at all, and whether it is pinned.

#### `rowsBeforeFirstPin` {#symbol-rowsbeforefirstpin}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/ladder-rooms.ts#L70)

##### `rowsBeforeFirstPin` — Summary
How many shown rows stand above a card's first pinned row, in the rows' order, or null when no shown row is pinned:
at the overview band the file's name may wrap down over the silent rows only as far as the first row still drawn.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
