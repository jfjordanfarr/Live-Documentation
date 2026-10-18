# scripts/layout-lab/drift.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: scripts/layout-lab/drift.test.ts
- Generated At: 2026-10-18T00:31:16.223Z

## Authored
### Purpose
Holds the drift measure to what it claims: the spread measures, the carry rules across a membership change, and the two halves of the finding that led to gravity, over a toy graph of two clusters that never reference each other ([the October 17 session](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-17.1.record.md#turn-5)).

### Notes
The third test is the measure's reason to exist and can fail either way: with the forces as they were (no gravity, unbounded reach) the extent must grow by more than a fifth over five cycles, and with gravity it must stay within a tenth. The thresholds are a fifth and a tenth of the start, chosen apart from each other so that a simulation that neither drifts nor returns fails both; they are not tuned to pass. The simulation is deterministic through D3's own random source, so the numbers repeat.

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
- [`drift.toggledArchetype`](./drift.ts.mdmd.md#symbol-toggledarchetype)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
