# packages/explorer/src/client/views/localView/branch-order.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/branch-order.ts
- Generated At: 2026-10-05T17:18:21.661Z

## Authored
### Purpose

Orders a ranked Local Map exploration so that its wires cross as little as the directory bands allow, and reserves a lane through every column that a reference skips.

### Notes

This is the ordering and lane step of layered graph drawing, with the Membrane Map's directory bands as a constraint: files of one directory stay together in a column, and a band's row is the same in every column it spans. The sweep walks the columns left to right and then right to left, settling each column by the barycenter of what it is wired to in the column just settled; the band rows are repacked once per pass from where every member's wires lead; the order with the fewest crossings between adjacent columns is kept. A reference that skips columns gets a virtual node in each column it passes, slotted among that column's files by the same barycenter, so that the gap it names becomes the lane the renderer leaves between two cards and the router threads the wire through. Nothing is hidden and nothing is bundled: every reference keeps its own wire and its own lane place.

The best order is a snapshot with its own arrays: a pass settles columns in place, and a snapshot that shared them drifted from its bands, which drew the page in one order and the lanes in another until the estate's five-file picture showed sixteen wires across cards ([the October 5 session](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-05.1.record.md#turn-4)). The test that the bands walk to exactly the returned columns keeps that invariant. Written on 2026-10-05 under the owner's answers on routing as a balance rather than a rule.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ForwardReference` {#symbol-forwardreference}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-order.ts#L19)

##### `ForwardReference` — Summary
A reference that reads forward, from a provider's column to a consumer's column to its right.

#### `OrderInput` {#symbol-orderinput}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-order.ts#L31)

##### `OrderInput` — Summary
What the ordering takes: the ranked columns, each file's directory, and the forward references with their heights on the cards.

#### `Lane` {#symbol-lane}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-order.ts#L41)

##### `Lane` — Summary
A gap in a column through which threaded wires pass: after the named file, or above the first file when `after` is null.

#### `BranchOrder` {#symbol-branchorder}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-order.ts#L50)

##### `BranchOrder` — Summary
The chosen order: the bands as rows and lists, the columns top to bottom, the lanes, each threaded reference's passages, and the crossings.

#### `orderBranches` {#symbol-orderbranches}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-order.ts#L84)
- Returns: [`BranchOrder`](#symbol-branchorder)
- Parameters: `input`: [`OrderInput`](#symbol-orderinput)

##### `orderBranches` — Summary
Orders a ranked exploration and reserves its lanes: the band rows and the
files within them by a barycenter sweep that keeps the fewest crossings, and
a lane through every column a reference skips. See the module note.

#### `walkColumns` {#symbol-walkcolumns}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-order.ts#L165)

##### `walkColumns` — Summary
The files of every column, top to bottom, as the bands' rows and lists lay them.

#### `repackRows` {#symbol-repackrows}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-order.ts#L197)
- Returns: [`DirectoryBand`](../membraneView/pin-layout.ts.mdmd.md#symbol-directoryband)[]

##### `repackRows` — Summary
Sorts every level of the band tree by the mean key of its members and packs
the siblings into rows in that order; bands whose columns do not overlap may
share a row. Ties keep the directories' alphabetical order.

#### `countCrossings` {#symbol-countcrossings}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-order.ts#L270)
- Parameters: `positions`: `ReadonlyMap`

##### `countCrossings` — Summary
Crossings between the wires of each adjacent column pair, by endpoint order.

#### `crossingsOf` {#symbol-crossingsof}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-order.ts#L289)

##### `crossingsOf` — Summary
The crossings among the wires between adjacent columns of an order, for a scope whose wires skip no column.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`pin-layout.DirectoryBand`](../membraneView/pin-layout.ts.mdmd.md#symbol-directoryband)
- [`pin-layout.FlowNode`](../membraneView/pin-layout.ts.mdmd.md#symbol-flownode)
- [`pin-layout.computeDirectoryBands`](../membraneView/pin-layout.ts.mdmd.md#symbol-computedirectorybands)
<!-- LIVE-DOC:END Dependencies -->
