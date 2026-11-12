# packages/explorer/src/client/views/localView/directory-flow.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/directory-flow.ts
- Generated At: 2026-11-12T22:02:41.608Z

## Authored
### Purpose

The pure half of the directory flow trial, in which an opened directory of the 2D Local Map shows how its own files connect: the lines that join each pair of file cards where one uses the other, each standing for the graph's links between them; the columns of a picture in flow order, with every opened directory's closed boxes at the head of its columns and its files that no line joins together after its last column; the rows at which a tall rank wraps so that the ranks stand about as wide as tall; and the cards a hovered card keeps lit. `branches.ts` calls it while it explores, `connections.ts` and `branch-renderer.ts` ask it what a line is, and the controller asks it for the hover.

### Notes

Current, and a trial: Tuning's Opened Directory chooses it, the grid of 2026-10-07 stays the default, and no production decision has been made. Written on 2026-11-12 from the root's brief, after a newcomer opened three directories, saw cards and no line, and concluded that the map draws no connections ([the first-visit review](../../../../../../../../AI-Agent-Workspace/Screenshots/2026-11-12/first-visit/README.md), finding 3), and the owner asked for something to feel and test rather than a decision. A pair line is an ordinary edge of the picture between the two cards' node-level hubs with a count, so that the ranking, the ordering, the placement and the wire drawing that solve a pinned neighbourhood solve an opened directory too; this module adds only what they cannot decide. Three choices were made by looking, and are recorded with their pictures in [the trial's evidence](../../../../../../../../AI-Agent-Workspace/Screenshots/2026-11-12/directory-flow-trial/README.md): the wrap is decided by the ranks alone (`squareRows`), after a first cap, the cards the frame holds, drew the sixty-file directory 23 columns wide and would have changed with the window's height; the block of files no line joins is as tall as the directory's tallest column or the square root of its count, after a first rule drew the scan root's eight as one row; and the closed boxes stand as a band above the files, across the flow's columns, by the root's answer that a person browsing looks for the next directory to open first.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `UndrawnLink` {#symbol-undrawnlink}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-flow.ts#L24)

##### `UndrawnLink` — Summary
A link of the graph between two file cards on screen that the picture draws no wire for.

#### `pairLines` {#symbol-pairlines}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-flow.ts#L37)
- Returns: [`LocalEdge`](./types.ts.mdmd.md#symbol-localedge)[]

##### `pairLines` — Summary
One line for each pair of files, each way: every undrawn link from one file to another gathered under one edge between
their node-level hubs, in the order the pairs first came, counting its links. A file's links to itself join no pair of
cards and make no line.

#### `flowNeighbours` {#symbol-flowneighbours}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-flow.ts#L54)
- Parameters: `cards`: `ReadonlySet`

##### `flowNeighbours` — Summary
The cards a hover of one card keeps lit (the directory flow trial's hover): the card itself and the card at the far
end of every line and wire that touches it, a return's among them. Null when the card is not in the picture, and then
nothing is faded.

#### `isPairLine` {#symbol-ispairline}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-flow.ts#L65)

##### `isPairLine` — Summary
Whether an edge is a pair line of an opened directory rather than a reference between two symbols.

#### `linksOf` {#symbol-linksof}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-flow.ts#L68)

##### `linksOf` — Summary
How many of the graph's links an edge stands for: a pair line's count, one for a reference.

#### `squareRows` {#symbol-squarerows}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-flow.ts#L77)

##### `squareRows` — Summary
How many cards a column holds before its rank wraps, so that the ranks stand about as wide as tall, as the grid's
cards do: the least number of rows at which the wrapped ranks take no more columns than that. It is decided by the
ranks alone, so the same directory wraps the same way in every window, and no resize moves a card. A first cap, the
cards the frame holds at reading size (three at 1440 by 900), drew this repository's sixty-file directory 23 columns
and 10,845 px wide, against 9 ranks and 4,399 px unwrapped (2026-11-12), and changed with the window's height.

#### `wrapRanks` {#symbol-wrapranks}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-flow.ts#L90)

##### `wrapRanks` — Summary
The ranking's columns with every rank that holds more than `rows` cards wrapped into neighbouring columns, as few as
hold it and as even as they can be, its cards in the order given. No line joins two cards of one rank, so the wrap
drops nothing; the ranks keep their order, so a file still never stands left of a file it offers to. Null wraps nothing.

#### `FlowInput` {#symbol-flowinput}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-flow.ts#L100)

##### `FlowInput` — Summary
What {@link flowColumns} lays out.

#### `flowColumns` {#symbol-flowcolumns}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-flow.ts#L132)
- Parameters: `input`: [`FlowInput`](#symbol-flowinput)

##### `flowColumns` — Summary
The columns of a picture whose opened directories stand in flow order.

The ranks stand left to right, wrapped ({@link wrapRanks}). Then each opened directory that has a file in them, the
deepest first so that a directory counts what the directories under it took:
- its closed boxes go one to a column across the columns the directory already holds, again from the first when there
  are more boxes than columns, and at the head of each column's list: a band above its files (the ordering keeps them
  first, by `leading`), since a person browsing looks for the next directory to open before anything else (the root's
  answer, 2026-11-12);
- its files that no line joins stand together in a block after its last column, read row by row, as tall as its
  tallest column, boxes counted, or the square root of their count, whichever is more.

An opened directory with no file in the ranks, one that holds only subdirectories or whose files join nothing, is laid
out as the grid lays it (`placeMembers` in `branches.ts`): from its nearest ancestor's first column, else the first,
about as wide as tall. So a picture with no line and no pin is the grid's picture.

Every id given stands in exactly one column, and the ranks' cards keep their order across the columns.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`directory-state.OpenDirectories`](./directory-state.ts.mdmd.md#symbol-opendirectories)
- [`directory-state.under`](./directory-state.ts.mdmd.md#symbol-under)
- [`types.LocalEdge`](./types.ts.mdmd.md#symbol-localedge) (type-only)
- [`wire-gathering.NODE_HUB`](./wire-gathering.ts.mdmd.md#symbol-node_hub)
- [`types.ExplorerLinkKind`](../../../shared/types.ts.mdmd.md#symbol-explorerlinkkind) (type-only)
<!-- LIVE-DOC:END Dependencies -->
