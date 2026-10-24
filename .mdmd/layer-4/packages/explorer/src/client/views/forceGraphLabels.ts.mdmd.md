# packages/explorer/src/client/views/forceGraphLabels.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/forceGraphLabels.ts
- Generated At: 2026-10-23T22:17:27.236Z

## Authored
### Purpose
Places readable identity labels beside projected 3D spheres, giving the subject and retained exploration priority while keeping labels apart and inside the usable viewport.

### Notes
Created for the owner’s [October 23 choice](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-23.1.record.md#turn-5) to prioritize names and reveal more as space permits. Placement is pure screen geometry; the renderer supplies measured text, projected spheres, priorities and interface obstacles. A previously usable side stays preferred so camera motion does not needlessly flip a name around its sphere. Crowded names wait for space rather than shrinking their type. A name also avoids the projected discs of equal or higher-priority spheres, so contextual text cannot masquerade as the identity of a more important body. Ten CSS pixels between name rectangles give the dense neighbourhood room to read, selected during the [October 24 visual pass](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-24.1.record.md#turn-12).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LabelBox` {#symbol-labelbox}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLabels.ts#L2)

##### `LabelBox` — Summary
Screen-space placement for readable names beside the 3D Local Map's spheres.

#### `SpatialLabel` {#symbol-spatiallabel}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLabels.ts#L5)

##### `SpatialLabel` — Summary
A measured name and its projected sphere; lower priorities are placed first.

#### `placeSpatialLabels` {#symbol-placespatiallabels}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLabels.ts#L16)
- Parameters: `previous`: `ReadonlyMap`

##### `placeSpatialLabels` — Summary
Place names near their spheres, keeping text readable and leaving crowded names for a closer view.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
