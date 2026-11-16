# packages/explorer/src/client/views/localView/cycle-trials.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/cycle-trials.ts
- Generated At: 2026-11-16T05:26:03.708Z

## Authored
### Purpose
What the 2D Local Map's continuing search and the layout lab share to try a cycle's other orders: the two terms a ranking adds to a picture's price, in pixels of wire (the wires' horizontal length and the Return Cost of every returning link), the trials a picture's cycles offer, and the search over them as a pure walk.

### Notes
Written on 2026-11-16 ([Turn 5 of the November 15 record](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-15.1.record.md#turn-5)), the third answer of the day to which references a cycle returns. The first stood every cycle in its fewest-returns order; the second priced the candidates at the ranking, which could not see a column's height; the third priced them on a nominal placement before the first draw, which took seconds and judged by cards all one size. The root then decided that the candidates are trials of the continuing search, on the page's own measurements, and this module holds what that needs beside the search's own state (`branch-search.ts`).

`horizontalWire` measures each forward reference from its provider's column's right edge to its consumer's column's left edge, weighed as the placement weighs vertical wire; an order within the columns never changes it, so the search's other trials did not need it. `rankingTerms` adds the Return Cost of every returning link, a pair line counting the links it stands for. `cycleOrdersOf` lists the orders to try, every cycle's offered orders but the one it stands in when the search begins, each tried once; `nextCycleTrial` skips an order a trial has since adopted. `walkCycleTrials` is the search over them as the page runs it in idle moments, a trial adopted when its price with its churn is below the standing picture's; the lab's `evaluate` and the unit tests run it, the page runs the same steps with its DOM in `branch-renderer.ts`.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `horizontalWire` {#symbol-horizontalwire}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/cycle-trials.ts#L24)

##### `horizontalWire` — Summary
The wires' horizontal length: for every reference the picture draws forward, the distance from its provider's column's
right edge to its consumer's column's left edge, weighed as the placement weighs its vertical length.

#### `returningLinks` {#symbol-returninglinks}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/cycle-trials.ts#L37)

##### `returningLinks` — Summary
The references a picture reads backward, each pair line counting the links it stands for.

#### `rankingTerms` {#symbol-rankingterms}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/cycle-trials.ts#L42)

##### `rankingTerms` — Summary
What a ranking adds to a picture's price, in pixels of wire: its wires' horizontal length and its returns at the Return Cost.

#### `CycleTrial` {#symbol-cycletrial}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/cycle-trials.ts#L47)

##### `CycleTrial` — Summary
One trial: a cycle, by its key, standing in another of its offered orders.

#### `cycleOrdersOf` {#symbol-cycleordersof}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/cycle-trials.ts#L56)
- Returns: [`CycleTrial`](#symbol-cycletrial)[]

##### `cycleOrdersOf` — Summary
The orders the picture's cycles offer beside the ones they stand in when the search begins, cycle by cycle and each
cycle's in its offered order, the greedy order first: each is tried once.

#### `nextCycleTrial` {#symbol-nextcycletrial}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/cycle-trials.ts#L61)
- Parameters: `standing`: `ReadonlyMap`

##### `nextCycleTrial` — Summary
The next trial from `from` on, past any order a trial already adopted; null when none is left.

#### `standingOrders` {#symbol-standingorders}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/cycle-trials.ts#L70)

##### `standingOrders` — Summary
The order each cycle stands in, by its key.

#### `WalkedPicture` {#symbol-walkedpicture}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/cycle-trials.ts#L73)

##### `WalkedPicture` — Summary
A picture the walk holds: its cycles' orders, and its price without churn, the two terms included.

#### `walkCycleTrials` {#symbol-walkcycletrials}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/cycle-trials.ts#L84)
- Parameters: `first`: `P`; `orders`: `ReadonlyMap`; `standing`: `P`
- Constraints: [`WalkedPicture`](#symbol-walkedpicture)

##### `walkCycleTrials` — Summary
The search over a picture's cycle trials as a pure walk, the lab's and the tests' version of what the page does in its
idle moments: each trial in turn (`nextCycleTrial`), against the picture that then stands, is priced (`price`, with
its churn against the standing picture, and without) and adopted when its price with churn is strictly below the
standing picture's own, as the search judges any trial.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`branch-scene.Scene`](./branch-scene.ts.mdmd.md#symbol-scene) (type-only)
- [`branches.BranchGraph`](./branches.ts.mdmd.md#symbol-branchgraph)
- [`branches.CycleOffer`](./branches.ts.mdmd.md#symbol-cycleoffer)
- [`branches.edgeKey`](./branches.ts.mdmd.md#symbol-edgekey)
- [`directory-flow.linksOf`](./directory-flow.ts.mdmd.md#symbol-linksof)
<!-- LIVE-DOC:END Dependencies -->
