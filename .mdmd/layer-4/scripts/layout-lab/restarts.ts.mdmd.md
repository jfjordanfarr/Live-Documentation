# scripts/layout-lab/restarts.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/layout-lab/restarts.ts
- Generated At: 2026-10-07T14:15:48.068Z

## Authored
### Purpose

The order step's starts tabulated for one scope: what the page prices each start at beside what the deck would read of its picture, and a trial of the costs saying which start the page would keep at each and which the full weighted score prefers.

### Notes

Every start is laid out alone through `evaluate` (the ranked order as `orderSeed` null with no restarts, then the seeds 1 to `--starts` each forced), so a row's cheap signals are the ones the page sees the moment that start is placed (the vertical length, the order's own crossings, the height, and the churn against the ranked start's picture) and its full signals are the deck's over the routed wires (the length, the crossing spots, the samples over foreign membranes, the escaping wires). `trialCosts` then prices every start at each setting of the crossing and height costs and names the page's pick beside the full score's; the markdown says where they agree. The costs in the Local Map's tuning were set from the four deck scopes' tables on 2026-10-06: on this repository's two scopes the cheapest start by vertical length is also the full score's choice, so any cost agrees; on the estate's five files the full score prefers a start with a quarter fewer crossing spots at a percent less length, which the page picks only once a crossing costs 60 px of wire or more; on the estate's chain the full score prefers the one start with no foreign sample, which the page picks from a crossing cost of 40. The owner asked for the score to be "tabulated and tuned" ([Turn 11](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-06.1.record.md#turn-11)); this is the table.
- `simulateSearch` (2026-10-07) runs the page's own judge from `branch-search.ts` over the tabulated starts at each of several churn costs: the first paint is the cheapest of the ranking's order and the first `orderStarts` seeds by the crossing and height costs, each later seed is priced with its churn against the shown picture's tops and adopted when that beats the shown picture's own price, until the patience or the last seed; each row now carries its seed, its columns and its tops, which the churn between any two pictures is counted from. The report's new table says, per churn cost, the first paint, each move with its gain and the pairs it swaps, the starts tried, where the search stopped, and the final picture's price and full score. The lab's `restarts` verb takes `--churn`, `--first` and `--patience`.
- The wider space (2026-10-07, [Turn 18](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-06.1.record.md#turn-18)): `widenStarts` tabulates the starts again at every setting of a grid over the ranking's pull and tie rule and the order's sweeps (`DEFAULT_WIDE_GRID`, 36 settings), `summarizeSetting` names for each setting the start the page's price keeps, the start the full score prefers and where the page's search ends, every full score against the baseline setting's ranked start so that the settings compare, and `renderWide` writes one line per setting and the settings ranked three ways: by where the search ends, by their best start, by the page's price. The simulation follows the page's judge, whose patience counts since that day the starts since the best price found improved, not since the last adoption.
- The wide report's start cells carry the vertical length, the height and the fragments beside the full score (2026-10-07, the wall), since the full score's membrane terms shrink when a setting draws fewer membranes and compare only within one `membraneDepth`.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `StartRow` {#symbol-startrow}
- Type: interface
- Source: [source](../../../../scripts/layout-lab/restarts.ts#L33)

##### `StartRow` — Summary
One start laid out alone: what the page would price it at, and what the deck would read of its picture.

#### `DEFAULT_COST_GRID` {#symbol-default_cost_grid}
- Type: const
- Source: [source](../../../../scripts/layout-lab/restarts.ts#L46)

##### `DEFAULT_COST_GRID` — Summary
The costs tried by default: a crossing at nothing to forty pixels of wire, a pixel of height at nothing to five.

#### `parseCosts` {#symbol-parsecosts}
- Type: function
- Source: [source](../../../../scripts/layout-lab/restarts.ts#L49)
- Returns: [`StartCosts`](../../packages/explorer/src/client/views/localView/branch-restarts.ts.mdmd.md#symbol-startcosts)[]

##### `parseCosts` — Summary
`crossing=a,b;height=c,d`: every combination, the churn cost nothing, since the lab has no previous picture.

#### `tabulateStarts` {#symbol-tabulatestarts}
- Type: function
- Source: [source](../../../../scripts/layout-lab/restarts.ts#L60)
- Returns: [`StartRow`](#symbol-startrow)[]
- Parameters: `capture`: [`Capture`](./capture.ts.mdmd.md#symbol-capture); `graph`: [`ExplorerGraphPayload`](../../packages/explorer/src/shared/types.ts.mdmd.md#symbol-explorergraphpayload); `run`: [`ScopeRun`](./scopes.ts.mdmd.md#symbol-scoperun); `config`: [`LabConfig`](./evaluate.ts.mdmd.md#symbol-labconfig)

##### `tabulateStarts` — Summary
Every start alone: the ranked order first, then the seeds 1 to `seeds`; each start's churn is against the ranked start's picture.

#### `Adoption` {#symbol-adoption}
- Type: interface
- Source: [source](../../../../scripts/layout-lab/restarts.ts#L76)

##### `Adoption` — Summary
One picture the search would move to: the start, what the move gains in the shown picture's own price, the pairs of cards it swaps, and after how many starts.

#### `SearchTrial` {#symbol-searchtrial}
- Type: interface
- Source: [source](../../../../scripts/layout-lab/restarts.ts#L84)

##### `SearchTrial` — Summary
The page's search simulated at one churn cost over the tabulated starts.

#### `simulateSearch` {#symbol-simulatesearch}
- Type: function
- Source: [source](../../../../scripts/layout-lab/restarts.ts#L100)
- Returns: [`SearchTrial`](#symbol-searchtrial)[]
- Parameters: `costs`: [`StartCosts`](../../packages/explorer/src/client/views/localView/branch-restarts.ts.mdmd.md#symbol-startcosts)

##### `simulateSearch` — Summary
The page's sequence at each churn cost: the first paint is the cheapest of the ranking's order and the first
`orderStarts` seeds by the costs, churn aside; then each further seed in order is priced with its churn against the
shown picture and adopted when that beats the shown picture's own price, by the page's own judge, until the patience
or the last tabulated seed. The pictures must be tabulated in seed order, the ranking's first.

#### `CostTrial` {#symbol-costtrial}
- Type: interface
- Source: [source](../../../../scripts/layout-lab/restarts.ts#L121)

##### `CostTrial` — Summary
One setting of the costs tried: the start the page would keep, the start the full score prefers, and both by the full score.

#### `trialCosts` {#symbol-trialcosts}
- Type: function
- Source: [source](../../../../scripts/layout-lab/restarts.ts#L130)
- Returns: [`CostTrial`](#symbol-costtrial)[]
- Parameters: `weights`: [`Weights`](./sweep.ts.mdmd.md#symbol-weights)

##### `trialCosts` — Summary
At each setting of the costs, the page's pick and the full score's, the ranked start scoring the sum of the weights by definition.

#### `renderRestarts` {#symbol-renderrestarts}
- Type: function
- Source: [source](../../../../scripts/layout-lab/restarts.ts#L145)
- Parameters: `run`: [`ScopeRun`](./scopes.ts.mdmd.md#symbol-scoperun); `weights`: [`Weights`](./sweep.ts.mdmd.md#symbol-weights); `capture`: [`Capture`](./capture.ts.mdmd.md#symbol-capture)

##### `renderRestarts` — Summary
The tabulation as a person reads it.

#### `DEFAULT_WIDE_GRID` {#symbol-default_wide_grid}
- Type: const
- Source: [source](../../../../scripts/layout-lab/restarts.ts#L188)

##### `DEFAULT_WIDE_GRID` — Summary
The levers of the ranking and the order the wider space walks by default: every pull, tie rule and sweep count the design has stood at or near.

#### `WideSetting` {#symbol-widesetting}
- Type: interface
- Source: [source](../../../../scripts/layout-lab/restarts.ts#L191)

##### `WideSetting` — Summary
One setting of the ranking's and the order's levers: its starts, and the start each judge would keep.

#### `summarizeSetting` {#symbol-summarizesetting}
- Type: function
- Source: [source](../../../../scripts/layout-lab/restarts.ts#L216)
- Returns: [`WideSetting`](#symbol-widesetting)
- Parameters: `config`: [`LabConfig`](./evaluate.ts.mdmd.md#symbol-labconfig); `base`: [`Signals`](./signals.ts.mdmd.md#symbol-signals); `weights`: [`Weights`](./sweep.ts.mdmd.md#symbol-weights); `costs`: [`StartCosts`](../../packages/explorer/src/client/views/localView/branch-restarts.ts.mdmd.md#symbol-startcosts)

##### `summarizeSetting` — Summary
A setting summarized from its tabulated starts: the start the page's price keeps (the costs, churn aside), the start the
full score prefers against `base` (the baseline setting's ranked start), and the page's search at `churn` from the first
`first` seeds with the patience.

#### `widenStarts` {#symbol-widenstarts}
- Type: function
- Source: [source](../../../../scripts/layout-lab/restarts.ts#L233)
- Returns: [`WideSetting`](#symbol-widesetting)[]
- Parameters: `capture`: [`Capture`](./capture.ts.mdmd.md#symbol-capture); `graph`: [`ExplorerGraphPayload`](../../packages/explorer/src/shared/types.ts.mdmd.md#symbol-explorergraphpayload); `run`: [`ScopeRun`](./scopes.ts.mdmd.md#symbol-scoperun); `baseline`: [`LabConfig`](./evaluate.ts.mdmd.md#symbol-labconfig); `weights`: [`Weights`](./sweep.ts.mdmd.md#symbol-weights); `costs`: [`StartCosts`](../../packages/explorer/src/client/views/localView/branch-restarts.ts.mdmd.md#symbol-startcosts)

##### `widenStarts` — Summary
Every setting of the grid, the baseline first, with its starts tabulated and summarized; every full score is against
the baseline setting's ranked start, so the settings compare. `progress` hears each setting as it is done.

#### `renderWide` {#symbol-renderwide}
- Type: function
- Source: [source](../../../../scripts/layout-lab/restarts.ts#L252)
- Parameters: `run`: [`ScopeRun`](./scopes.ts.mdmd.md#symbol-scoperun); `weights`: [`Weights`](./sweep.ts.mdmd.md#symbol-weights); `capture`: [`Capture`](./capture.ts.mdmd.md#symbol-capture)

##### `renderWide` — Summary
The wider space as a person reads it: every setting on one line, then the settings ranked three ways.
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
- [`report.differences`](./report.ts.mdmd.md#symbol-differences)
- [`scopes.ScopeRun`](./scopes.ts.mdmd.md#symbol-scoperun) (type-only)
- [`Signals`](./signals.ts.mdmd.md#symbol-signals) (type-only)
- [`sweep.LeverValues`](./sweep.ts.mdmd.md#symbol-levervalues)
- [`sweep.Weights`](./sweep.ts.mdmd.md#symbol-weights)
- [`sweep.configurations`](./sweep.ts.mdmd.md#symbol-configurations)
- [`sweep.scoreOf`](./sweep.ts.mdmd.md#symbol-scoreof)
<!-- LIVE-DOC:END Dependencies -->
