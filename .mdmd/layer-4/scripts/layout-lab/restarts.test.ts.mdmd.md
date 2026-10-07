# scripts/layout-lab/restarts.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: scripts/layout-lab/restarts.test.ts
- Generated At: 2026-10-07T13:20:48.777Z

## Authored
### Purpose

Holds the tabulation's pure parts: the grid of costs parsed, and the page's pick and the full score's preference named at each cost.

### Notes

Three starts with made-up signals: by the full score the ranked start is preferred; by the page's price the shortest vertical wins at no cost, a start with fewer crossings wins at twenty pixels a crossing, and at forty the ranked start ties it and, earlier, wins. The grid parser takes every crossing cost with every height cost, the churn nothing, since the lab has no previous picture.
- The search's simulation (2026-10-07): seven hand-made starts, a churn-free run that adopts twice, a dear churn that lets one of them go, and a patience of one that settles after a single unadopted start.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`restarts.StartRow`](./restarts.ts.mdmd.md#symbol-startrow)
- [`restarts.parseCosts`](./restarts.ts.mdmd.md#symbol-parsecosts)
- [`restarts.simulateSearch`](./restarts.ts.mdmd.md#symbol-simulatesearch)
- [`restarts.trialCosts`](./restarts.ts.mdmd.md#symbol-trialcosts)
- [`Signals`](./signals.ts.mdmd.md#symbol-signals) (type-only)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
