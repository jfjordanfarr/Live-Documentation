# packages/explorer/src/client/views/localView/branch-restarts.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/branch-restarts.ts
- Generated At: 2026-10-06T23:02:44.658Z

## Authored
### Purpose

The order step's restarts: the Local Map's one inexact step run from several fixed starts, each picture priced by what the exact placement knows the moment it is solved, and the cheapest kept.

### Notes

Ranking and placement are exact, so running them twice gives one answer; the barycenter sweep of `branch-order.ts` is a local search, and where it ends depends on where it begins. The layout lab's first sweep found the start the largest layout lever and a lottery (on this repository's five-file scope a shuffled start ends a quarter to a third shorter than the ranking's own order), so the page tries several: the ranking's order first, then the order the previous picture stood its files in (by their tops, the files that picture did not show following in their ranked order), then the shuffles by the seeds 1 to `orderStarts`; a forced `orderSeed` is tried alone, so the lab can ask for one start by name. Every start is laid out by the caller's `layout` function (the renderer measures the page's own cards for each, the lab its capture) and priced in pixels of wire: the vertical length (the placement's measure) plus `crossingCost` per crossing of the order's own count, `heightCost` per pixel of the picture's height and `churnCost` per pair of cards in one column that stand the other way round from the previous picture. Of two starts at one price the earlier wins, so the ranking's order stands unless another is cheaper and the previous picture's stands before any shuffle, which is what keeps a picture put across a re-layout. The starts are fixed, so the same pins give the same picture every time. The costs were set from the lab's `restarts` tabulation on 2026-10-06, at the values where the page's cheap choice agrees with the full weighted score on all four deck scopes (a crossing at 80 px, a pixel of height at 5); the churn cost (100) awaits a tabulation with a previous picture, which the animated re-layout's work will bring. Built after the owner's go ([Turn 12](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-06.1.record.md#turn-12): "Let's try it out!"), who asked for "a weighted score that can be tabulated and tuned" ([Turn 11](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-06.1.record.md#turn-11)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Start` {#symbol-start}
- Type: type
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-restarts.ts#L22)

##### `Start` — Summary
Where the order step may begin: the ranking's own order, a shuffle by a seed, or the order the previous picture stood its files in.

#### `StartCosts` {#symbol-startcosts}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-restarts.ts#L25)

##### `StartCosts` — Summary
What a start's picture costs beyond its vertical wire length, each in pixels of wire.

#### `StartSignals` {#symbol-startsignals}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-restarts.ts#L35)

##### `StartSignals` — Summary
The signals a start is priced on, every one known the moment its placement is solved.

#### `StartOutcome` {#symbol-startoutcome}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-restarts.ts#L47)

##### `StartOutcome` — Summary
A start laid out and priced.

#### `startName` {#symbol-startname}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-restarts.ts#L57)

##### `startName` — Summary
A start's name, as the page and the lab's reports write it.

#### `startOrder` {#symbol-startorder}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-restarts.ts#L60)

##### `startOrder` — Summary
The order step's options for a start.

#### `candidateStarts` {#symbol-candidatestarts}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-restarts.ts#L68)
- Returns: [`Start`](#symbol-start)[]
- Parameters: `previous`: `ReadonlyMap`

##### `candidateStarts` — Summary
The starts to try: the ranking's order first, the previous picture's when it showed any of these files, then the
shuffles by the seeds 1 to `seeds`. A forced seed is tried alone, so that a lever of the lab can ask for one start by
name and the page draws that start.

#### `previousStart` {#symbol-previousstart}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-restarts.ts#L77)
- Parameters: `previous`: `ReadonlyMap`

##### `previousStart` — Summary
Each ranked column in the order the previous picture stood its files, by their tops; the files it did not show follow in their ranked order.

#### `churnOf` {#symbol-churnof}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-restarts.ts#L85)
- Parameters: `previous`: `ReadonlyMap`

##### `churnOf` — Summary
Pairs of cards in one column that stand the other way round from the previous picture; cards that picture did not show count nothing.

#### `scoreOf` {#symbol-scoreof}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-restarts.ts#L98)
- Parameters: `signals`: [`StartSignals`](#symbol-startsignals); `costs`: [`StartCosts`](#symbol-startcosts)

##### `scoreOf` — Summary
A start's price: its vertical length and what its crossings, its height and its churn cost, in pixels of wire.

#### `layoutStarts` {#symbol-layoutstarts}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-restarts.ts#L106)
- Parameters: `start`: [`Start`](#symbol-start); `costs`: [`StartCosts`](#symbol-startcosts); `previous`: `ReadonlyMap`

##### `layoutStarts` — Summary
Lays out every start and keeps the cheapest. Of two at one price the earlier wins, so the ranking's own order stands
unless another start is cheaper, and the previous picture's stands before any shuffle.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`branch-scene.Scene`](./branch-scene.ts.mdmd.md#symbol-scene) (type-only)
- [`branches.BranchGraph`](./branches.ts.mdmd.md#symbol-branchgraph) (type-only)
- [`branches.OrderOptions`](./branches.ts.mdmd.md#symbol-orderoptions) (type-only)
<!-- LIVE-DOC:END Dependencies -->
