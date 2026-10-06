# scripts/layout-lab/restarts.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: scripts/layout-lab/restarts.test.ts
- Generated At: 2026-10-06T23:02:45.911Z

## Authored
### Purpose

Holds the tabulation's pure parts: the grid of costs parsed, and the page's pick and the full score's preference named at each cost.

### Notes

Three starts with made-up signals: by the full score the ranked start is preferred; by the page's price the shortest vertical wins at no cost, a start with fewer crossings wins at twenty pixels a crossing, and at forty the ranked start ties it and, earlier, wins. The grid parser takes every crossing cost with every height cost, the churn nothing, since the lab has no previous picture.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`restarts.StartRow`](./restarts.ts.mdmd.md#symbol-startrow)
- [`restarts.parseCosts`](./restarts.ts.mdmd.md#symbol-parsecosts)
- [`restarts.trialCosts`](./restarts.ts.mdmd.md#symbol-trialcosts)
- [`Signals`](./signals.ts.mdmd.md#symbol-signals) (type-only)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
