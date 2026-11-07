# packages/explorer/src/client/views/forceGraphLabels.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/forceGraphLabels.ts
- Generated At: 2026-11-07T07:46:34.176Z

## Authored
### Purpose
Places readable identity labels beside projected 3D spheres, giving the subject and retained exploration priority while keeping labels apart and inside the usable viewport.

### Notes
Created for the owner’s [October 23 choice](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-23.1.record.md#turn-5) to prioritize names and reveal more as space permits. Placement is pure screen geometry; the renderer supplies measured text, projected spheres, priorities and interface obstacles. A previously usable side stays preferred so camera motion does not needlessly flip a name around its sphere. Crowded names wait for space rather than shrinking their type. A name also avoids the projected discs of equal or higher-priority spheres, so contextual text cannot masquerade as the identity of a more important body. Ten CSS pixels between name rectangles give the dense neighbourhood room to read, selected during the [October 24 visual pass](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-24.1.record.md#turn-12).

Since 2026-11-07 a name may stand beside a sphere that is no longer drawn: a popped directory's name takes the radius its skin had as its own, about the centroid of what it released, so that it no longer lands on the bubble it released and the names of directories popped one inside another stand apart at their skins' sizes, and it keeps nothing clear of it (`clear`, zero), since the names of what it released stand within it.

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
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLabels.ts#L22)
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
