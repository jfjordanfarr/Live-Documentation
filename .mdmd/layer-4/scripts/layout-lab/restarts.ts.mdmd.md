# scripts/layout-lab/restarts.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/layout-lab/restarts.ts
- Generated At: 2026-10-07T13:20:48.798Z

## Authored
### Purpose

The order step's starts tabulated for one scope: what the page prices each start at beside what the deck would read of its picture, and a trial of the costs saying which start the page would keep at each and which the full weighted score prefers.

### Notes

Every start is laid out alone through `evaluate` (the ranked order as `orderSeed` null with no restarts, then the seeds 1 to `--starts` each forced), so a row's cheap signals are the ones the page sees the moment that start is placed (the vertical length, the order's own crossings, the height, and the churn against the ranked start's picture) and its full signals are the deck's over the routed wires (the length, the crossing spots, the samples over foreign membranes, the escaping wires). `trialCosts` then prices every start at each setting of the crossing and height costs and names the page's pick beside the full score's; the markdown says where they agree. The costs in the Local Map's tuning were set from the four deck scopes' tables on 2026-10-06: on this repository's two scopes the cheapest start by vertical length is also the full score's choice, so any cost agrees; on the estate's five files the full score prefers a start with a quarter fewer crossing spots at a percent less length, which the page picks only once a crossing costs 60 px of wire or more; on the estate's chain the full score prefers the one start with no foreign sample, which the page picks from a crossing cost of 40. The owner asked for the score to be "tabulated and tuned" ([Turn 11](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-06.1.record.md#turn-11)); this is the table.
- `simulateSearch` (2026-10-07) runs the page's own judge from `branch-search.ts` over the tabulated starts at each of several churn costs: the first paint is the cheapest of the ranking's order and the first `orderStarts` seeds by the crossing and height costs, each later seed is priced with its churn against the shown picture's tops and adopted when that beats the shown picture's own price, until the patience or the last seed; each row now carries its seed, its columns and its tops, which the churn between any two pictures is counted from. The report's new table says, per churn cost, the first paint, each move with its gain and the pairs it swaps, the starts tried, where the search stopped, and the final picture's price and full score. The lab's `restarts` verb takes `--churn`, `--first` and `--patience`.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `StartRow` {#symbol-startrow}
- Type: interface
- Source: [source](../../../../scripts/layout-lab/restarts.ts#L28)

##### `StartRow` — Summary
One start laid out alone: what the page would price it at, and what the deck would read of its picture.

#### `DEFAULT_COST_GRID` {#symbol-default_cost_grid}
- Type: const
- Source: [source](../../../../scripts/layout-lab/restarts.ts#L41)

##### `DEFAULT_COST_GRID` — Summary
The costs tried by default: a crossing at nothing to forty pixels of wire, a pixel of height at nothing to five.

#### `parseCosts` {#symbol-parsecosts}
- Type: function
- Source: [source](../../../../scripts/layout-lab/restarts.ts#L44)
- Returns: [`StartCosts`](../../packages/explorer/src/client/views/localView/branch-restarts.ts.mdmd.md#symbol-startcosts)[]

##### `parseCosts` — Summary
`crossing=a,b;height=c,d`: every combination, the churn cost nothing, since the lab has no previous picture.

#### `tabulateStarts` {#symbol-tabulatestarts}
- Type: function
- Source: [source](../../../../scripts/layout-lab/restarts.ts#L55)
- Returns: [`StartRow`](#symbol-startrow)[]
- Parameters: `capture`: [`Capture`](./capture.ts.mdmd.md#symbol-capture); `graph`: [`ExplorerGraphPayload`](../../packages/explorer/src/shared/types.ts.mdmd.md#symbol-explorergraphpayload); `run`: [`ScopeRun`](./scopes.ts.mdmd.md#symbol-scoperun); `config`: [`LabConfig`](./evaluate.ts.mdmd.md#symbol-labconfig)

##### `tabulateStarts` — Summary
Every start alone: the ranked order first, then the seeds 1 to `seeds`; each start's churn is against the ranked start's picture.

#### `Adoption` {#symbol-adoption}
- Type: interface
- Source: [source](../../../../scripts/layout-lab/restarts.ts#L71)

##### `Adoption` — Summary
One picture the search would move to: the start, what the move gains in the shown picture's own price, the pairs of cards it swaps, and after how many starts.

#### `SearchTrial` {#symbol-searchtrial}
- Type: interface
- Source: [source](../../../../scripts/layout-lab/restarts.ts#L79)

##### `SearchTrial` — Summary
The page's search simulated at one churn cost over the tabulated starts.

#### `simulateSearch` {#symbol-simulatesearch}
- Type: function
- Source: [source](../../../../scripts/layout-lab/restarts.ts#L95)
- Returns: [`SearchTrial`](#symbol-searchtrial)[]
- Parameters: `costs`: [`StartCosts`](../../packages/explorer/src/client/views/localView/branch-restarts.ts.mdmd.md#symbol-startcosts)

##### `simulateSearch` — Summary
The page's sequence at each churn cost: the first paint is the cheapest of the ranking's order and the first
`orderStarts` seeds by the costs, churn aside; then each further seed in order is priced with its churn against the
shown picture and adopted when that beats the shown picture's own price, by the page's own judge, until the patience
or the last tabulated seed. The pictures must be tabulated in seed order, the ranking's first.

#### `CostTrial` {#symbol-costtrial}
- Type: interface
- Source: [source](../../../../scripts/layout-lab/restarts.ts#L116)

##### `CostTrial` — Summary
One setting of the costs tried: the start the page would keep, the start the full score prefers, and both by the full score.

#### `trialCosts` {#symbol-trialcosts}
- Type: function
- Source: [source](../../../../scripts/layout-lab/restarts.ts#L125)
- Returns: [`CostTrial`](#symbol-costtrial)[]
- Parameters: `weights`: [`Weights`](./sweep.ts.mdmd.md#symbol-weights)

##### `trialCosts` — Summary
At each setting of the costs, the page's pick and the full score's, the ranked start scoring the sum of the weights by definition.

#### `renderRestarts` {#symbol-renderrestarts}
- Type: function
- Source: [source](../../../../scripts/layout-lab/restarts.ts#L140)
- Parameters: `run`: [`ScopeRun`](./scopes.ts.mdmd.md#symbol-scoperun); `weights`: [`Weights`](./sweep.ts.mdmd.md#symbol-weights); `capture`: [`Capture`](./capture.ts.mdmd.md#symbol-capture)

##### `renderRestarts` — Summary
The tabulation as a person reads it.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`branch-restarts.StartCosts`](../../packages/explorer/src/client/views/localView/branch-restarts.ts.mdmd.md#symbol-startcosts)
- [`branch-restarts.StartSignals`](../../packages/explorer/src/client/views/localView/branch-restarts.ts.mdmd.md#symbol-startsignals)
- [`branch-restarts.churnOf`](../../packages/explorer/src/client/views/localView/branch-restarts.ts.mdmd.md#symbol-churnof)
- [`branch-restarts.scoreOf`](../../packages/explorer/src/client/views/localView/branch-restarts.ts.mdmd.md#symbol-scoreof)
- [`branch-search.beginSearch`](../../packages/explorer/src/client/views/localView/branch-search.ts.mdmd.md#symbol-beginsearch)
- [`branch-search.judgeStart`](../../packages/explorer/src/client/views/localView/branch-search.ts.mdmd.md#symbol-judgestart)
- [`types.ExplorerGraphPayload`](../../packages/explorer/src/shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`Capture`](./capture.ts.mdmd.md#symbol-capture) (type-only)
- [`evaluate.LabConfig`](./evaluate.ts.mdmd.md#symbol-labconfig)
- [`evaluate`](./evaluate.ts.mdmd.md#symbol-evaluate)
- [`scopes.ScopeRun`](./scopes.ts.mdmd.md#symbol-scoperun) (type-only)
- [`Signals`](./signals.ts.mdmd.md#symbol-signals) (type-only)
- [`sweep.Weights`](./sweep.ts.mdmd.md#symbol-weights)
- [`sweep.scoreOf`](./sweep.ts.mdmd.md#symbol-scoreof)
<!-- LIVE-DOC:END Dependencies -->
