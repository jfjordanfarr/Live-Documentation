# scripts/layout-lab/restarts.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: scripts/layout-lab/restarts.test.ts
- Generated At: 2026-10-07T14:15:48.043Z

## Authored
### Purpose

Holds the tabulation's pure parts: the grid of costs parsed, and the page's pick and the full score's preference named at each cost.

### Notes

Three starts with made-up signals: by the full score the ranked start is preferred; by the page's price the shortest vertical wins at no cost, a start with fewer crossings wins at twenty pixels a crossing, and at forty the ranked start ties it and, earlier, wins. The grid parser combines every requested cost, retains explicitly supplied shape prices unless varied, and sets churn to zero because the lab has no previous picture.
- The search's simulation (2026-10-07): seven hand-made starts, a churn-free run that adopts twice, a dear churn that lets one of them go, and a patience of one that settles after a single unadopted start.
- The wider space (2026-10-07): a setting summarized from three starts, the page's pick and the full score's and a search that adopts nothing, scored against a given base and against another; and the search's simulation going on past a better start refused for its churn, where a patience of one settles at a start that betters nothing.
Shape-price cases make a longer-wire start win separately under boundary-step, unevenness and row-levelness costs, both before paint and during later adoptions. Those cases protect the [October 13 shared scoring change](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-2--recovered-owner-scope-reply); interleaved alignment trials are covered by [the evaluation tests](./evaluate.test.ts.mdmd.md).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`evaluate.baselineConfig`](./evaluate.ts.mdmd.md#symbol-baselineconfig)
- [`restarts.StartRow`](./restarts.ts.mdmd.md#symbol-startrow)
- [`restarts.parseCosts`](./restarts.ts.mdmd.md#symbol-parsecosts)
- [`restarts.simulateSearch`](./restarts.ts.mdmd.md#symbol-simulatesearch)
- [`restarts.summarizeSetting`](./restarts.ts.mdmd.md#symbol-summarizesetting)
- [`restarts.trialCosts`](./restarts.ts.mdmd.md#symbol-trialcosts)
- [`Signals`](./signals.ts.mdmd.md#symbol-signals) (type-only)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
