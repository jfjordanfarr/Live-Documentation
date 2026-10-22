# packages/explorer/src/client/views/localView/branch-shape.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/branch-shape.ts
- Generated At: 2026-10-22T16:47:55.717Z

## Authored
### Purpose

Measures boundary distance, nonzero step count and directly owned card-row misalignment once for both the Explorer’s layout competition and the headless layout lab.

### Notes

Step distance and step count express different preferences: redistributing the same vertical distance across fewer turns leaves the former unchanged. Only drawn directories contribute boundaries. Row alignment includes a directory’s directly owned files even when a loose-file bucket holds them, while nested-directory descendants belong to their own row term. Shared measurements keep candidate selection and command reports from disagreeing about the active preferences.

Created for the owner’s October 13, 2026 request to tune aesthetic preferences within the existing competition: [the originating discussion](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-2--recovered-owner-scope-reply).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ShapeSignals` {#symbol-shapesignals}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-shape.ts#L14)

##### `ShapeSignals` — Summary
The shape of the drawn membranes and their directly owned rows, shared by the page's competition and the layout lab.

#### `shapeSignalsOf` {#symbol-shapesignalsof}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-shape.ts#L27)
- Returns: [`ShapeSignals`](#symbol-shapesignals)

##### `shapeSignalsOf` — Summary
Measures every drawn boundary, including nested ones; invisible roots, loose-file buckets and lanes have no shape
price. Rows pair cards in their column order only within their own membrane, with no partner across an empty column.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`branch-scene.Scene`](./branch-scene.ts.mdmd.md#symbol-scene)
- [`branch-scene.rowItemsOf`](./branch-scene.ts.mdmd.md#symbol-rowitemsof)
- [`branches.BranchGraph`](./branches.ts.mdmd.md#symbol-branchgraph) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
