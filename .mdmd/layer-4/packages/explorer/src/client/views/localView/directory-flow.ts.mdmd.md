# `packages/explorer/src/client/views/localView/directory-flow.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/explorer/src/client/views/localView/directory-flow.ts`
- Generated At: 2026-11-22T07:12:55.917Z

## Authored
### Purpose

The pure half of the directory flow trial, in which an opened directory of the 2D Local Map shows how its own files connect: the lines that join each pair of file cards where one uses the other, each standing for the graph's links between them; the columns of a picture in flow order, in a given shape: how a tall rank wraps, how many rows every opened directory's closed boxes stand in at the head of its columns, and how many columns its files that no line joins stand across after its files' last column; the walk over those shapes that the picture's price prices (`searchFlowShape`) and the nominal card model it prices them on (`nominalMeasurer`); and the cards a hovered card keeps lit. `branches.ts` calls it while it explores and lays an exploration out in another shape, `branch-renderer.ts` runs the walk with the page's price and asks it what a line is, as `connections.ts` does, and the controller asks it for the hover.

### Notes

Current: Tuning's Opened Directory chooses it, the default since 2026-11-13 with the grid of 2026-10-07 one choice away. Written on 2026-11-12 from the root's brief, after a newcomer opened three directories, saw cards and no line, and concluded that the map draws no connections ([the first-visit review](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-12/Screenshots/first-visit/README.md), finding 3), and the owner asked for something to feel and test rather than a decision. A pair line is an ordinary edge of the picture between the two cards' node-level hubs with a count, so that the ranking, the ordering, the placement and the wire drawing that solve a pinned neighbourhood solve an opened directory too; this module adds only what they cannot decide. Three choices were made by looking, and are recorded with their pictures in [the trial's evidence](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-12/Screenshots/directory-flow-trial/README.md): the wrap is decided by the ranks alone (`squareRows`), after a first cap, the cards the frame holds, drew the sixty-file directory 23 columns wide and would have changed with the window's height; the block of files no line joins is as tall as the directory's tallest column or the square root of its count, after a first rule drew the scan root's eight as one row; and the closed boxes stand as a band above the files, across the flow's columns, by the root's answer that a person browsing looks for the next directory to open first.

On 2026-11-13 the first two rules and the boxes' dealing gave way to the price ([the record, Turn 4](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-13/2026-11-13.1.record.md#turn-4): "If a user can understand software at a glance better by adding that extra term to the "price", go ahead and add it"): the price gained a term for the picture's width, and `searchFlowShape` walks from the narrowest shape (no wrap, the boxes within the files' columns, the line-less files in one column), widening one choice at a time while each step is strictly cheaper, the wrap first and then each directory's boxes and line-less files, the deepest directory first. The walk only bounds how many shapes are priced; the price decides. `squareRows`, which stood the ranks about as wide as tall counted in cards and so drew the sixty-file directory far wider than tall in pixels, was removed, as was the line-less block's square-root rule. What stays a rule is where things stand, not how many rows or columns they take: the boxes head their directory's columns from its first, and the line-less files stand after its files' last column. [The pictures and numbers](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-13/Screenshots/directory-flow-price/) are the evidence.

The same day a pin on the sixty-file directory re-wrapped its tallest rank and moved every card, and a cost for how far the cards on screen would travel, tried next, kept a wrap chosen for twenty files over a pinned picture of sixty-four. So the shape is chosen on the opened directories alone, their files unpinned, on a nominal card model (`NOMINAL_CARD`, `NOMINAL_BOX`, `NOMINAL_LABEL`, `nominalMeasurer`), once for the directories, filters and tuning, and reused at every pin; and it governs only the opened directories' own files (`wrapOwn`). The model also keeps fonts out of the choice: the root found the owner's screen drew taller lines than this container's, so a shape chosen from measured cards could have differed between two people opening one link. A browser case holds the nominal card to the page's median unpinned card.

Since 2026-11-15 ([November 15, Turn 1](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-1)) `NOMINAL_LABEL` is the strip's own constant, `HANDLE_STRIP` of `directory-handle.ts`, 60 units where the measured one-line label had been 30: a label's height no longer depends on its text or the screen, so on this point the nominal model is the page.

Since 2026-11-19 ([Turn 23 of the November 18 record](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-23)) a pair line keeps the symbols at the two ends of each link it stands for (`standsFor`), so that a row's hover keeps the lines that carry its links (`symbol-highlight.ts`); until then a row pointed at in Flow faded every line of the picture.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `UndrawnLink` {#symbol-undrawnlink}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-flow.ts#L27)

##### `UndrawnLink` — Summary
A link of the graph between two file cards on screen that the picture draws no wire for.

#### `pairLines` {#symbol-pairlines}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-flow.ts#L45)
- Returns: [`LocalEdge`](./types.ts.mdmd.md#symbol-localedge)[]

##### `pairLines` — Summary
One line for each pair of files, each way: every undrawn link from one file to another gathered under one edge between
their node-level hubs, in the order the pairs first came, counting its links and keeping the symbols at their ends
(`standsFor`), by which a hovered row finds the lines that carry its links (2026-11-19). A file's links to itself join
no pair of cards and make no line.

#### `flowNeighbours` {#symbol-flowneighbours}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-flow.ts#L63)
- Parameters: `cards`: `ReadonlySet`

##### `flowNeighbours` — Summary
The cards a hover of one card keeps lit (the directory flow trial's hover): the card itself and the card at the far
end of every line and wire that touches it, a return's among them. Null when the card is not in the picture, and then
nothing is faded.

#### `isPairLine` {#symbol-ispairline}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-flow.ts#L74)

##### `isPairLine` — Summary
Whether an edge is a pair line of an opened directory rather than a reference between two symbols.

#### `linksOf` {#symbol-linksof}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-flow.ts#L77)

##### `linksOf` — Summary
How many of the graph's links an edge stands for: a pair line's count, one for a reference.

#### `wrapRanks` {#symbol-wrapranks}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-flow.ts#L84)

##### `wrapRanks` — Summary
The ranking's columns with every rank that holds more than `rows` cards wrapped into neighbouring columns, as few as
hold it and as even as they can be, its cards in the order given. No line joins two cards of one rank, so the wrap
drops nothing; the ranks keep their order, so a file still never stands left of a file it offers to. Null wraps nothing.

#### `FlowInput` {#symbol-flowinput}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-flow.ts#L94)

##### `FlowInput` — Summary
What {@link flowColumns} lays out.

#### `FlowShape` {#symbol-flowshape}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-flow.ts#L113)

##### `FlowShape` — Summary
How the things no line places stand in a picture in flow order: how a tall rank wraps, how many rows each opened
directory's closed boxes stand in, and how many columns its files that no line joins stand across. Rules chose these
until 2026-11-13; the picture's price now does, its width set against its height ({@link searchFlowShape}), on the
owner's leave to add that term ("If a user can understand software at a glance better by adding that extra term to
the "price", go ahead and add it", 2026-11-13).

#### `NARROW_SHAPE` {#symbol-narrow_shape}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-flow.ts#L123)
- Returns: [`FlowShape`](#symbol-flowshape)

##### `NARROW_SHAPE` — Summary
The narrowest shape, where the search begins: no rank wrapped, every box within its files' columns, the line-less files in one column.

#### `shapeRecord` {#symbol-shaperecord}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-flow.ts#L126)

##### `shapeRecord` — Summary
A shape as plain data, for the page to say which it drew.

#### `flowColumns` {#symbol-flowcolumns}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-flow.ts#L222)
- Parameters: `input`: [`FlowInput`](#symbol-flowinput); `shape`: [`FlowShape`](#symbol-flowshape)

##### `flowColumns` — Summary
The columns of a picture whose opened directories stand in flow order, in a given shape.

The ranks stand left to right, wrapped at the shape's rows ({@link wrapRanks}). Then each opened directory that has a
file in them, the deepest first so that a directory counts what the directories under it took:
- its closed boxes stand at the head of its columns, from its first column, in the shape's rows for it: one to a
  column across as many columns as that needs, again from the first column in the next row, and no fewer columns than
  its files hold or its boxes need; past its files' last column they stand in columns of their own. They head their
  columns' lists, a band above its files (the ordering keeps them first, by `leading`), since a person browsing looks
  for the next directory to open before anything else (the root's answer, 2026-11-12);
- its files that no line joins stand together in a block after its files' last column, under any boxes there, read
  row by row across the shape's columns for it.

An opened directory with no file in the ranks, one that holds only subdirectories or whose files join nothing, is laid
out as the grid lays it (`placeMembers` in `branches.ts`): from its nearest ancestor's first column, else the first,
about as wide as tall. So a picture with no line and no pin is the grid's picture.

Every id given stands in exactly one column, and the ranks' cards keep their order across the columns.

#### `NOMINAL_CARD` {#symbol-nominal_card}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-flow.ts#L237)

##### `NOMINAL_CARD` — Summary
The nominal sizes the shape is chosen on, in the picture's own pixels (2026-11-13). A directory's shape is a coarse
choice, how a rank wraps and how many rows of boxes and columns of line-less files it takes, and is chosen on the
directory's structure with every unpinned file card at one size and every closed box at another, so that no font,
screen, pin or path the person took enters it: two people opening the same link are shown the same shape. The picture
itself is still drawn from the page's own measurements. The numbers are the page's unpinned cards at their natural
sizes on 2026-11-13, at 1440 by 900 in this container's fonts, on `scripts`, `scripts/live-docs`, the explorer's
`client` and `localView` and the estate sample's `Contracts`: file cards 200 to 491 wide (medians 200 to 311) and 154
to 208 tall (medians 154 to 183); every closed box 160 by 81; a directory's label 30 tall, 42 where it wraps. A browser
case holds the file card to the page's median unpinned card, so that a change to the card does not leave it behind.

#### `NOMINAL_BOX` {#symbol-nominal_box}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-flow.ts#L239)

##### `NOMINAL_BOX` — Summary
A closed directory's box on the nominal model: every box the page drew on 2026-11-13.

#### `NOMINAL_LABEL` {#symbol-nominal_label}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-flow.ts#L241)

##### `NOMINAL_LABEL` — Summary
A directory's label on the nominal model: the strip the layout keeps for its handle, the page's own constant since 2026-11-15 (one line, 30, before).

#### `nominalMeasurer` {#symbol-nominalmeasurer}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-flow.ts#L251)
- Returns: [`SceneMeasurer`](./branch-scene.ts.mdmd.md#symbol-scenemeasurer)
- Parameters: `ids`: `Iterable`

##### `nominalMeasurer` — Summary
The scene's measurer on the nominal model: every file card {@link NOMINAL_CARD}, every closed box {@link NOMINAL_BOX},
no wider than a card cap when one is set, every directory's label {@link NOMINAL_LABEL} tall, and every line's end at a
card's node-level hub, half way down it as the stylesheet stood it until 2026-11-19. The page now stands a hub at its
name's first line (`hubLine` in wire-gathering.ts); the model keeps the middle, since moving it changes the shapes the
price chooses (on `scripts/live-docs` Width Cost at nought then no longer widens the default shape), which is the
owner's to choose. A closed box ends no line.

#### `ShapeSearch` {#symbol-shapesearch}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-flow.ts#L265)

##### `ShapeSearch` — Summary
What {@link searchFlowShape} found: the cheapest shape it met and its price, and every shape it priced, in order.

#### `searchFlowShape` {#symbol-searchflowshape}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-flow.ts#L282)
- Returns: [`ShapeSearch`](#symbol-shapesearch)
- Parameters: `input`: [`FlowInput`](#symbol-flowinput); `shape`: [`FlowShape`](#symbol-flowshape)

##### `searchFlowShape` — Summary
The shape the price chooses, by a walk from the narrowest shape that prices each choice in turn: first how a tall rank
wraps, from no wrap toward more columns; then, for each opened directory in flow order, the deepest first, its boxes
from as many rows as its files' columns need toward one row, and its line-less files from one column toward one row.
Each walk moves on while the next value is strictly cheaper and stops at the first that is not, so that a choice the
price does not ask for is never made, and a tie keeps the narrower shape. The price is the picture's own, what the
page pays for every picture, its width counted against its height, so that nothing is decided by a rule beside it;
the walk only bounds how many shapes are priced. The page prices the shapes on the nominal model
({@link nominalMeasurer}) and the directory's own files, unpinned, so the same directory under the same tuning and
filters takes the same shape on every screen, after any pins and from any link.

#### `wrapChoices` {#symbol-wrapchoices}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-flow.ts#L339)

##### `wrapChoices` — Summary
The rows at which the ranks wrap differently, from the tallest rank's down: each wraps them into more columns than the last.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`branch-scene.SceneMeasurer`](./branch-scene.ts.mdmd.md#symbol-scenemeasurer) (type-only)
- [`directory-handle.HANDLE_STRIP`](./directory-handle.ts.mdmd.md#symbol-handle_strip)
- [`directory-state.OpenDirectories`](./directory-state.ts.mdmd.md#symbol-opendirectories) (type-only)
- [`directory-state.under`](./directory-state.ts.mdmd.md#symbol-under)
- [`types.LocalEdge`](./types.ts.mdmd.md#symbol-localedge) (type-only)
- [`wire-gathering.NODE_HUB`](./wire-gathering.ts.mdmd.md#symbol-node_hub)
- [`types.ExplorerLinkKind`](../../../shared/types.ts.mdmd.md#symbol-explorerlinkkind) (type-only)
<!-- LIVE-DOC:END Dependencies -->
