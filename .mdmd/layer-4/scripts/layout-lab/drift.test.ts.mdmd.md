# scripts/layout-lab/drift.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: scripts/layout-lab/drift.test.ts
- Generated At: 2026-10-21T20:42:26.178Z

## Authored
### Purpose
Holds the drift measure to what it claims: the spread measures, the carry rules across a membership change, and the two halves of the finding that led to gravity, over a toy graph of two clusters that never reference each other ([the October 17 session](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-17.1.record.md#turn-5)).

### Notes
The third test is the measure's reason to exist and can fail either way: with the forces as they were (no gravity, unbounded reach) the extent must grow by more than a fifth over five cycles, and with gravity it must stay within a tenth. The thresholds are a fifth and a tenth of the start, chosen apart from each other so that a simulation that neither drifts nor returns fails both; they are not tuned to pass. The simulation is deterministic through D3's own random source, so the numbers repeat. Since 2026-10-18 that test names the update energy as one, the full reheat the page made of every change when the drift was measured, since the measure now feeds each change by the tuning's energy.

The carry test (2026-10-18) reads the page's own rule through the lab's `carryPositions`: a sphere that stood keeps its place, a new hub starts at its members' centroid, and a born file starts beside its hub and not on it. The energy test holds the measure's new column: at placement alone no tick is taken and no unchanged sphere moves, so the extent never changes; at a tenth the changes settle in two hundred ticks and stir the unchanged less than half as much as the full reheat's three hundred; and the rendered table carries the energy, the settle and the toggled count where it says it does. Made for ticket C2 of [the change-over-time plan](../../../layer-3/change-over-time.mdmd.md#open-questions).

Since 2026-10-18 the rendered table's expected row reads the spring from the tuning it was measured at, not from a constant, so that the shipped default may change without the test saying anything about it.

Since 2026-10-21 the energy test holds the motion's meaning of the lever: every change comes to rest, a tenth of the strength takes longer than the full (137 to 142 ticks against 371 to 474 on the toy) and reaches much the same rest, and placement alone still takes no tick and moves nothing; the gravity test's bounds held unchanged under the motion (1.43 times over five cycles without gravity, 0.99 with). The settle column is a range, `rangeOf`. Since 2026-10-28 the rendered row carries the approximation beside the reach.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`local-storage.getDefaultTuning`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-getdefaulttuning)
- [`types.ExplorerGraphPayload`](../../packages/explorer/src/shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`types.ExplorerNodePayload`](../../packages/explorer/src/shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
- [`drift.carryPositions`](./drift.ts.mdmd.md#symbol-carrypositions)
- [`drift.diagonalOf`](./drift.ts.mdmd.md#symbol-diagonalof)
- [`drift.extentOf`](./drift.ts.mdmd.md#symbol-extentof)
- [`drift.measureDrift`](./drift.ts.mdmd.md#symbol-measuredrift)
- [`drift.rangeOf`](./drift.ts.mdmd.md#symbol-rangeof)
- [`drift.renderDriftReports`](./drift.ts.mdmd.md#symbol-renderdriftreports)
- [`drift.toggledArchetype`](./drift.ts.mdmd.md#symbol-toggledarchetype)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
