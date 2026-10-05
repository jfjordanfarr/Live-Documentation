# packages/explorer/src/client/views/localView/branch-order.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/branch-order.ts
- Generated At: 2026-10-05T19:22:51.282Z

## Authored
### Purpose

Orders a ranked Local Map exploration so that its wires cross as little as the directory bands allow, bundles the wires of one offering pin through the columns they pass together, and reserves each bundle a lane inside a directory that holds an end of every wire in it.

### Notes

This is the ordering and lane step of layered graph drawing, with the Membrane Map's directory bands as a constraint: files of one directory stay together in a column, and a band's row is the same in every column it spans. The sweep walks the columns left to right and then right to left, settling each column by the barycenter of what it is wired to in the column just settled; the band rows are repacked once per pass from where every member's wires lead; the order with the fewest crossings between adjacent columns is kept. A bundle is the wires of one offering pin: they run together through every column they pass, and each leaves in the gutter before its consumer's column, where the eye needs the separation; the shared run is one segment, so the sweep counts its crossings once and stops arranging identical strings. This is the edge bundling of layered drawings (Pupyrev, Nachmanson and Kaufmann, 2010), taken up on 2026-10-05 after the owner saw the first pass's "guitar strings" of parallel wires and asked to keep a bundle bunched until separation is warranted ([Turn 8](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-05.1.record.md#turn-8)). A bundle's stand-in in a column it passes is a virtual node placed in the band tree: into the deepest directory spanning that column that holds an end of every wire in the bundle, else the root, so that no lane lies inside a directory that holds neither end, which the first pass did when it placed every lane after a file. In a directory's stack of files the stand-in joins the column's list and the lane is the gap after a file or above the first; in a directory of directories the stand-ins of one column share a lane band of their own, whose row is packed with its sibling directories' rows; a directory that spans a column with no file of its own there keeps its wire inside its box through a column of only its lane. Every reference keeps its own wire; the bundle only shares its place.

The band tree is never mutated, so the best order is a snapshot of it and the columns and lanes are read from that one tree at the end; the first pass kept the columns beside the bands and a snapshot that shared arrays drifted from them, which drew the page in one order and the lanes in another until the estate's five-file picture showed sixteen wires across cards ([Turn 4](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-05.1.record.md#turn-4)). The test that the bands walk to exactly the returned columns keeps that invariant, and the test that a lane holds no wire whose ends are both outside its host keeps the other. Written on 2026-10-05 under the owner's answers on routing as a balance rather than a rule.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ForwardReference` {#symbol-forwardreference}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-order.ts#L23)

##### `ForwardReference` — Summary
A reference that reads forward, from a provider's column to a consumer's column to its right.

#### `OrderInput` {#symbol-orderinput}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-order.ts#L37)

##### `OrderInput` — Summary
What the ordering takes: the ranked columns, each file's directory, and the forward references with their heights on the cards.

#### `Bundle` {#symbol-bundle}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-order.ts#L47)

##### `Bundle` — Summary
The wires of one offering pin that pass one column together, sharing a slot in its lane.

#### `Lane` {#symbol-lane}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-order.ts#L54)

##### `Lane` — Summary
A gap through which threaded wires pass, inside a directory that holds an end of every wire in it.

#### `BranchOrder` {#symbol-branchorder}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-order.ts#L68)

##### `BranchOrder` — Summary
The chosen order: the bands as rows and lists, the columns top to bottom, the lanes, each threaded reference's passages, and the crossings.

#### `orderBranches` {#symbol-orderbranches}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-order.ts#L109)
- Returns: [`BranchOrder`](#symbol-branchorder)
- Parameters: `input`: [`OrderInput`](#symbol-orderinput)

##### `orderBranches` — Summary
Orders a ranked exploration and reserves its lanes: the band rows and the
files within them by a barycenter sweep that keeps the fewest crossings, and
a lane through every column a bundle passes. See the module note.

#### `walkColumns` {#symbol-walkcolumns}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-order.ts#L290)

##### `walkColumns` — Summary
The files of every column, top to bottom, as the bands' rows and lists lay them.

#### `repackRows` {#symbol-repackrows}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-order.ts#L326)
- Returns: [`DirectoryBand`](../membraneView/pin-layout.ts.mdmd.md#symbol-directoryband)[]

##### `repackRows` — Summary
Sorts every level of the band tree by the mean key of its members and packs
the siblings into rows in that order; bands whose columns do not overlap may
share a row. Ties keep the directories' alphabetical order. Lane stand-ins
are sorted one by one, and those of one column that stand together, with no
directory spanning that column between them, share one lane band, so that a
lane goes where its wires lead and no row is spent that another lane can
share.

#### `countCrossings` {#symbol-countcrossings}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-order.ts#L395)
- Parameters: `positions`: `ReadonlyMap`

##### `countCrossings` — Summary
Crossings between the wires of each adjacent column pair, by endpoint order.

#### `crossingsOf` {#symbol-crossingsof}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-order.ts#L414)

##### `crossingsOf` — Summary
The crossings among the wires between adjacent columns of an order, for a scope whose wires skip no column.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`pin-layout.DirectoryBand`](../membraneView/pin-layout.ts.mdmd.md#symbol-directoryband)
- [`pin-layout.FlowNode`](../membraneView/pin-layout.ts.mdmd.md#symbol-flownode)
- [`pin-layout.computeDirectoryBands`](../membraneView/pin-layout.ts.mdmd.md#symbol-computedirectorybands)
<!-- LIVE-DOC:END Dependencies -->
