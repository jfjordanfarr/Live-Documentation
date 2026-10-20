# packages/explorer/src/client/history/snapshot.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/history/snapshot.ts
- Generated At: 2026-10-20T21:28:54.114Z

## Authored
### Purpose
A shape of the history (the engine's `Shape` at one step) as the 3D Local Map's graph payload: a node per file with its archetype and its symbol count, a link per directed edge with its count, and nothing the sequence does not carry.

### Notes
- Built 2026-10-18 for ticket C4 of [the change-over-time plan](../../../../../../../.mdmd/layer-3/change-over-time.mdmd.md#open-questions). The docs of a past commit are not in the bundle, so a node of a moment has no symbol names, no doc path and no dependency lines; it carries `symbolCount`, which `symbolCountOf` in `forceGraphLayout.ts` reads where today's nodes are sized and labelled by their names' count, so that a sphere breathes with its symbols at every step and a hub with its members'. The reciprocal and parallel edges merge into one counted pair in `spatialGraphOf`, as today's references do. Kept by `snapshot.test.ts`.
- Since 2026-10-20 ([Turn 9](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md#turn-9)) `relatedDocLinksOf` names a moment's related documents, the links its files' authored words made then, as today's bundle names its Related Docs.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `snapshotGraphOf` {#symbol-snapshotgraphof}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/history/snapshot.ts#L23)
- Returns: [`ExplorerGraphPayload`](../../shared/types.ts.mdmd.md#symbol-explorergraphpayload)
- Parameters: `shape`: [`Shape`](../views/worldMap/layout.ts.mdmd.md#symbol-shape)

##### `snapshotGraphOf` — Summary
The payload the views render, for the shape at one step.

#### `relatedDocLinksOf` {#symbol-relateddoclinksof}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/history/snapshot.ts#L55)
- Returns: [`RelatedDocLink`](../../shared/staticExplorerData.ts.mdmd.md#symbol-relateddoclink)[]
- Parameters: `shape`: [`Shape`](../views/worldMap/layout.ts.mdmd.md#symbol-shape)

##### `relatedDocLinksOf` — Summary
The links from each file's authored words to a document at the step, as today's bundle names its Related Docs.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Shape`](../../../../engine/src/live-docs/history/shape.ts.mdmd.md#symbol-shape)
- [`shape.edgeEnds`](../../../../engine/src/live-docs/history/shape.ts.mdmd.md#symbol-edgeends)
- [`staticExplorerData.RelatedDocLink`](../../shared/staticExplorerData.ts.mdmd.md#symbol-relateddoclink) (type-only)
- [`types.ExplorerGraphPayload`](../../shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`types.ExplorerLinkPayload`](../../shared/types.ts.mdmd.md#symbol-explorerlinkpayload) (type-only)
- [`types.ExplorerNodePayload`](../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->
