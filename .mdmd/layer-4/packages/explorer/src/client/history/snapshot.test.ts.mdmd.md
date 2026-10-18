# packages/explorer/src/client/history/snapshot.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/history/snapshot.test.ts
- Generated At: 2026-10-18T05:36:01.316Z

## Authored
### Purpose
Tests of the snapshot's payload: a node per file in path order with its archetype, count and dependents, a link per directed edge with its count, and that the 3D layout sizes a past file by its count and a hub by the sum of its members' counts.

### Notes
- Written 2026-10-18 with the module, for the plan's C4; the second case runs the payload through `spatialGraphOf` and `spatialNodeValue`, so that a change there would show here.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Shape`](../../../../engine/src/live-docs/history/shape.ts.mdmd.md#symbol-shape)
- [`shape.edgeKey`](../../../../engine/src/live-docs/history/shape.ts.mdmd.md#symbol-edgekey)
- [`snapshot.snapshotGraphOf`](./snapshot.ts.mdmd.md#symbol-snapshotgraphof)
- [`local-storage.getDefaultTuning`](../persistence/local-storage.ts.mdmd.md#symbol-getdefaulttuning)
- [`forceGraphData.spatialGraphOf`](../views/forceGraphData.ts.mdmd.md#symbol-spatialgraphof)
- [`forceGraphLayout.spatialNodeValue`](../views/forceGraphLayout.ts.mdmd.md#symbol-spatialnodevalue)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
