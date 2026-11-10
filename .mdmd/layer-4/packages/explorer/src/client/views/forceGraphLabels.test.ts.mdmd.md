# packages/explorer/src/client/views/forceGraphLabels.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/views/forceGraphLabels.test.ts
- Generated At: 2026-11-10T16:20:12.439Z

## Authored
### Purpose
Verify that projected 3D names reserve space by importance, remain inside the viewport and avoid panels, while crowded names become visible when room opens.

### Notes
Created with the October 23 identity pass after the root playtest. The cases cover competition for the same space, retained placement sides, edge constraints and a contextual name that would cover a higher-priority body; they exercise the pure geometry independently of browser font measurement.

The cases added after [November 10, Turn 3](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-10.1.record.md#turn-3) distinguish a sphere from its larger ring, verify that an unnamed equal or higher-priority ring still reserves room (including a ring entering from beyond the viewport), invalidate a remembered side when new geometry enters, retain the priority exception for less important bodies, and allow a released name over a popped chip's empty centre without losing the chip's offset.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`forceGraphLabels.SpatialLabel`](./forceGraphLabels.ts.mdmd.md#symbol-spatiallabel)
- [`forceGraphLabels.SpatialLabelBody`](./forceGraphLabels.ts.mdmd.md#symbol-spatiallabelbody)
- [`forceGraphLabels.placeSpatialLabels`](./forceGraphLabels.ts.mdmd.md#symbol-placespatiallabels)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
