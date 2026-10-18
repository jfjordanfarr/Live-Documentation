# packages/explorer/src/client/history/snapshot.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/history/snapshot.ts
- Generated At: 2026-10-18T05:36:01.335Z

## Authored
### Purpose
A shape of the history (the engine's `Shape` at one step) as the 3D Local Map's graph payload: a node per file with its archetype and its symbol count, a link per directed edge with its count, and nothing the sequence does not carry.

### Notes
- Built 2026-10-18 for ticket C4 of [the change-over-time plan](../../../../../../../.mdmd/layer-3/change-over-time.mdmd.md#open-questions). The docs of a past commit are not in the bundle, so a node of a moment has no symbol names, no doc path and no dependency lines; it carries `symbolCount`, which `symbolCountOf` in `forceGraphLayout.ts` reads where today's nodes are sized and labelled by their names' count, so that a sphere breathes with its symbols at every step and a hub with its members'. The reciprocal and parallel edges merge into one counted pair in `spatialGraphOf`, as today's references do. Kept by `snapshot.test.ts`.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `snapshotGraphOf` {#symbol-snapshotgraphof}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/history/snapshot.ts#L20)
- Returns: [`ExplorerGraphPayload`](../../shared/types.ts.mdmd.md#symbol-explorergraphpayload)
- Parameters: `shape`: [`Shape`](../views/worldMap/layout.ts.mdmd.md#symbol-shape)

##### `snapshotGraphOf` — Summary
The payload the views render, for the shape at one step.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Shape`](../../../../engine/src/live-docs/history/shape.ts.mdmd.md#symbol-shape)
- [`shape.edgeEnds`](../../../../engine/src/live-docs/history/shape.ts.mdmd.md#symbol-edgeends)
- [`types.ExplorerGraphPayload`](../../shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`types.ExplorerLinkPayload`](../../shared/types.ts.mdmd.md#symbol-explorerlinkpayload) (type-only)
- [`types.ExplorerNodePayload`](../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->
