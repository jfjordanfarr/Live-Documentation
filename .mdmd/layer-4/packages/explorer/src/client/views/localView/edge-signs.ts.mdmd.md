# packages/explorer/src/client/views/localView/edge-signs.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/edge-signs.ts
- Generated At: 2026-10-30T15:02:32.643Z

## Authored
### Purpose
The shadows at the 2D Local Map's frame edges that say the picture continues past them. The frame starts a picture taller than itself at the top like a page rather than cutting both ends, so something has to say that there is more below; this module draws that sign, a fade deepening into each edge the picture crosses and nothing at the edges it does not, from the pure `hiddenEdges` rule of `layout-measure.ts`. It exists so that hidden content is indicated honestly without a scrollbar or a word of instruction, the owner's choice of 2026-10-30 ([Turn 3](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-30.1.record.md#turn-3)) for the October 23 review's finding 9.

### Notes
- The element stands inside the view after its layers, untransformed, sized by the controller to the map layer less what the open reader covers, and takes no pointer events; the stylesheet (`local.css`) draws the fades from its `data-above`, `data-below`, `data-left` and `data-right`.
- The controller updates it on every camera move, from the picture's bounds as last measured; the geometry reads are the layer's offsets, which no transform changes, so the update is cheap enough for a pan's every frame.
- A fade to the map's own background was tried first and was invisible: the page's background is six levels darker than the map's. The sign is a translucent black shadow instead.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `FramePlace` {#symbol-frameplace}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/edge-signs.ts#L15)
- Extends: [`Frame`](./layout-measure.ts.mdmd.md#symbol-frame)

##### `FramePlace` — Summary
Where the frame stands inside the view, in the view's own pixels, and its size.

#### `EdgeSigns` {#symbol-edgesigns}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/edge-signs.ts#L21)

##### `EdgeSigns` — Summary
The signs' element and the one way to move them.

#### `createEdgeSigns` {#symbol-createedgesigns}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/edge-signs.ts#L28)
- Returns: [`EdgeSigns`](#symbol-edgesigns)

##### `createEdgeSigns` — Summary
Makes the signs inside the view, after its layers so that they paint above the map.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`layout-measure.Bounds`](./layout-measure.ts.mdmd.md#symbol-bounds)
- [`layout-measure.Frame`](./layout-measure.ts.mdmd.md#symbol-frame)
- [`layout-measure.hiddenEdges`](./layout-measure.ts.mdmd.md#symbol-hiddenedges)
- [`types.MapTransform`](./types.ts.mdmd.md#symbol-maptransform) (type-only)
<!-- LIVE-DOC:END Dependencies -->
