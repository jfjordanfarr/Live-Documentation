# packages/explorer/src/client/views/worldMap/inside/layout.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/worldMap/inside/layout.ts
- Generated At: 2026-09-29T01:55:09.109Z

## Authored
### Purpose
_Pending authored purpose_

### Notes
_Pending notes_

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `CARD_W` {#symbol-card_w}
- Type: const
- Source: [source](../../../../../../../../../packages/explorer/src/client/views/worldMap/inside/layout.ts#L13)

#### `ROW_H` {#symbol-row_h}
- Type: const
- Source: [source](../../../../../../../../../packages/explorer/src/client/views/worldMap/inside/layout.ts#L14)

#### `HEAD_H` {#symbol-head_h}
- Type: const
- Source: [source](../../../../../../../../../packages/explorer/src/client/views/worldMap/inside/layout.ts#L15)

#### `GAP` {#symbol-gap}
- Type: const
- Source: [source](../../../../../../../../../packages/explorer/src/client/views/worldMap/inside/layout.ts#L16)

#### `X0` {#symbol-x0}
- Type: const
- Source: [source](../../../../../../../../../packages/explorer/src/client/views/worldMap/inside/layout.ts#L18)

##### `X0` — Summary
The least room left of the first column, and right of the last, for the wall labels.

#### `Y0` {#symbol-y0}
- Type: const
- Source: [source](../../../../../../../../../packages/explorer/src/client/views/worldMap/inside/layout.ts#L21)

#### `WALL_STEP` {#symbol-wall_step}
- Type: const
- Source: [source](../../../../../../../../../packages/explorer/src/client/views/worldMap/inside/layout.ts#L22)

#### `WALL_Y0` {#symbol-wall_y0}
- Type: const
- Source: [source](../../../../../../../../../packages/explorer/src/client/views/worldMap/inside/layout.ts#L23)

#### `PlacedNode` {#symbol-placednode}
- Type: interface
- Source: [source](../../../../../../../../../packages/explorer/src/client/views/worldMap/inside/layout.ts#L25)

#### `PlacedWall` {#symbol-placedwall}
- Type: interface
- Source: [source](../../../../../../../../../packages/explorer/src/client/views/worldMap/inside/layout.ts#L36)
- Extends: [`InsideWall`](./model.ts.mdmd.md#symbol-insidewall)

#### `InsideLayout` {#symbol-insidelayout}
- Type: interface
- Source: [source](../../../../../../../../../packages/explorer/src/client/views/worldMap/inside/layout.ts#L41)

#### `layoutInside` {#symbol-layoutinside}
- Type: function
- Source: [source](../../../../../../../../../packages/explorer/src/client/views/worldMap/inside/layout.ts#L49)
- Returns: [`InsideLayout`](#symbol-insidelayout)
- Parameters: `model`: [`InsideModel`](./model.ts.mdmd.md#symbol-insidemodel)

##### `layoutInside` — Summary
Lays the folder map out for a viewport, in map pixels.

#### `pinOf` {#symbol-pinof}
- Type: function
- Source: [source](../../../../../../../../../packages/explorer/src/client/views/worldMap/inside/layout.ts#L101)
- Parameters: `layout`: [`InsideLayout`](#symbol-insidelayout)

##### `pinOf` — Summary
Where a wire meets a node: at the row named, or the last row, on the left for a pin that takes or the right for one that gives.

#### `clamp` {#symbol-clamp}
- Type: function
- Source: [source](../../../../../../../../../packages/explorer/src/client/views/worldMap/inside/layout.ts#L113)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`model.InsideModel`](./model.ts.mdmd.md#symbol-insidemodel) (type-only)
- [`model.InsideWall`](./model.ts.mdmd.md#symbol-insidewall) (type-only)
<!-- LIVE-DOC:END Dependencies -->
