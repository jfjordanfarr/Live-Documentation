# packages/explorer/src/client/views/forceGraphBuilding.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/views/forceGraphBuilding.test.ts
- Generated At: 2026-11-15T23:30:01.014Z

## Authored
### Purpose
Unit cases for [`forceGraphBuilding.ts`](forceGraphBuilding.ts.mdmd.md): a building begins with the work and keeps its start, survives a lull shorter than the hold, is continued but never begun by the camera's framing flight, waits its delay before it is shown, and lets a pointer hover only once the map has built and the pointer has moved since building began.

### Notes
- Written with the module on November 15, 2026 ([Turn 4 of that day's record](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-4)). The cases follow the map frame by frame, as the view feeds it, and check that an unchanged building is returned as the very object, so that the view sees nothing to apply.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`forceGraphBuilding.BUILDING_HOLD`](./forceGraphBuilding.ts.mdmd.md#symbol-building_hold)
- [`forceGraphBuilding.BUILDING_SIGN_DELAY`](./forceGraphBuilding.ts.mdmd.md#symbol-building_sign_delay)
- [`forceGraphBuilding.Building`](./forceGraphBuilding.ts.mdmd.md#symbol-building)
- [`forceGraphBuilding.BuildingWork`](./forceGraphBuilding.ts.mdmd.md#symbol-buildingwork)
- [`forceGraphBuilding.NOT_BUILDING`](./forceGraphBuilding.ts.mdmd.md#symbol-not_building)
- [`forceGraphBuilding.buildingPhase`](./forceGraphBuilding.ts.mdmd.md#symbol-buildingphase)
- [`forceGraphBuilding.nextBuilding`](./forceGraphBuilding.ts.mdmd.md#symbol-nextbuilding)
- [`forceGraphBuilding.nodePointer`](./forceGraphBuilding.ts.mdmd.md#symbol-nodepointer)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
