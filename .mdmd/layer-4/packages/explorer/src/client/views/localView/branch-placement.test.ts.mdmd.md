# packages/explorer/src/client/views/localView/branch-placement.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/views/localView/branch-placement.test.ts
- Generated At: 2026-10-06T16:47:47.549Z

## Authored
### Purpose

Holds the placement to its constraints and its objective: columns in order at their gaps, boxes around their members and apart in their rows, wires aligned where they can be, the heavier bundle winning, boxes tight, never worse than the stacked start, and the same answer every run.

### Notes

Every test checks the placement is well formed by the same predicate, so a change that broke a constraint would fail every test that touches it.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`branch-placement.PlacementBand`](./branch-placement.ts.mdmd.md#symbol-placementband)
- [`branch-placement.PlacementInput`](./branch-placement.ts.mdmd.md#symbol-placementinput)
- [`branch-placement.PlacementLane`](./branch-placement.ts.mdmd.md#symbol-placementlane)
- [`branch-placement.PlacementWire`](./branch-placement.ts.mdmd.md#symbol-placementwire)
- [`branch-placement.Segment`](./branch-placement.ts.mdmd.md#symbol-segment)
- [`branch-placement.StackEntry`](./branch-placement.ts.mdmd.md#symbol-stackentry)
- [`branch-placement.placeBranches`](./branch-placement.ts.mdmd.md#symbol-placebranches)
- [`branch-placement.placementCost`](./branch-placement.ts.mdmd.md#symbol-placementcost)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
