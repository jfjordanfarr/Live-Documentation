# packages/explorer/src/client/views/localView/cycle-trials.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/views/localView/cycle-trials.test.ts
- Generated At: 2026-11-16T05:26:03.631Z

## Authored
### Purpose
Holds the cycle trials to their claims: the two terms' arithmetic, which orders are tried and in what order, the search's judgment keeping the greedy order on a tie and when a cheaper order's gain is below its move's churn, a remembered order overturned where another is cheaper, and a placed pair whose lighter direction returns once its returns cost more than the wire they save.

### Notes
Written with [cycle-trials.ts](cycle-trials.ts.mdmd.md) on 2026-11-16 ([Turn 5 of the November 15 record](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-5)). The placed pair is laid out on the nominal model for a test only: two cards in two columns 100 px apart, so the greedy order costs 100 + 3 × cost and the other 300 + cost, and the lighter direction returns between costs of 90 and 110.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`branch-restarts.scoreOf`](./branch-restarts.ts.mdmd.md#symbol-scoreof)
- [`branch-restarts.signalsOf`](./branch-restarts.ts.mdmd.md#symbol-signalsof)
- [`branch-scene.DEFAULT_SCENE_TUNING`](./branch-scene.ts.mdmd.md#symbol-default_scene_tuning)
- [`branch-scene.layoutScene`](./branch-scene.ts.mdmd.md#symbol-layoutscene)
- [`branch-scene.planBranches`](./branch-scene.ts.mdmd.md#symbol-planbranches)
- [`branches.BranchGraph`](./branches.ts.mdmd.md#symbol-branchgraph)
- [`branches.CycleOffer`](./branches.ts.mdmd.md#symbol-cycleoffer)
- [`branches.edgeKey`](./branches.ts.mdmd.md#symbol-edgekey)
- [`branches.exploreBranches`](./branches.ts.mdmd.md#symbol-explorebranches)
- [`branches.orderExploration`](./branches.ts.mdmd.md#symbol-orderexploration)
- [`branches.rankBranches`](./branches.ts.mdmd.md#symbol-rankbranches)
- [`cycle-trials.WalkedPicture`](./cycle-trials.ts.mdmd.md#symbol-walkedpicture)
- [`cycle-trials.cycleOrdersOf`](./cycle-trials.ts.mdmd.md#symbol-cycleordersof)
- [`cycle-trials.horizontalWire`](./cycle-trials.ts.mdmd.md#symbol-horizontalwire)
- [`cycle-trials.nextCycleTrial`](./cycle-trials.ts.mdmd.md#symbol-nextcycletrial)
- [`cycle-trials.rankingTerms`](./cycle-trials.ts.mdmd.md#symbol-rankingterms)
- [`cycle-trials.returningLinks`](./cycle-trials.ts.mdmd.md#symbol-returninglinks)
- [`cycle-trials.standingOrders`](./cycle-trials.ts.mdmd.md#symbol-standingorders)
- [`cycle-trials.walkCycleTrials`](./cycle-trials.ts.mdmd.md#symbol-walkcycletrials)
- [`directory-flow.nominalMeasurer`](./directory-flow.ts.mdmd.md#symbol-nominalmeasurer)
- [`types.LocalEdge`](./types.ts.mdmd.md#symbol-localedge) (type-only)
- [`pin-state.EMPTY_PIN_SET`](../pin-state.ts.mdmd.md#symbol-empty_pin_set)
- [`pin-state.addPin`](../pin-state.ts.mdmd.md#symbol-addpin)
- [`types.ExplorerGraphPayload`](../../../shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`types.ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
