# packages/explorer/src/client/views/worldMap/inside/layout.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/worldMap/inside/layout.ts
- Generated At: 2026-09-29T14:19:43.487Z

## Authored
### Purpose
_Pending authored purpose_

### Notes
_Pending notes_

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ROW_H` {#symbol-row_h}
- Type: const
- Source: [source](../../../../../../../../../packages/explorer/src/client/views/worldMap/inside/layout.ts#L15)

#### `HEAD_H` {#symbol-head_h}
- Type: const
- Source: [source](../../../../../../../../../packages/explorer/src/client/views/worldMap/inside/layout.ts#L16)

#### `GAP` {#symbol-gap}
- Type: const
- Source: [source](../../../../../../../../../packages/explorer/src/client/views/worldMap/inside/layout.ts#L17)

#### `Y0` {#symbol-y0}
- Type: const
- Source: [source](../../../../../../../../../packages/explorer/src/client/views/worldMap/inside/layout.ts#L18)

#### `WALL_STEP` {#symbol-wall_step}
- Type: const
- Source: [source](../../../../../../../../../packages/explorer/src/client/views/worldMap/inside/layout.ts#L19)

#### `WALL_Y0` {#symbol-wall_y0}
- Type: const
- Source: [source](../../../../../../../../../packages/explorer/src/client/views/worldMap/inside/layout.ts#L20)

#### `X0` {#symbol-x0}
- Type: const
- Source: [source](../../../../../../../../../packages/explorer/src/client/views/worldMap/inside/layout.ts#L22)

##### `X0` — Summary
The least room left of the first column, and right of the last, for the wall labels.

#### `WIRE_GAP` {#symbol-wire_gap}
- Type: const
- Source: [source](../../../../../../../../../packages/explorer/src/client/views/worldMap/inside/layout.ts#L24)

##### `WIRE_GAP` — Summary
Room between a column's right edge and the next column, for the wires to bend in.

#### `MIN_CARD_W` {#symbol-min_card_w}
- Type: const
- Source: [source](../../../../../../../../../packages/explorer/src/client/views/worldMap/inside/layout.ts#L25)

#### `MAX_CARD_W` {#symbol-max_card_w}
- Type: const
- Source: [source](../../../../../../../../../packages/explorer/src/client/views/worldMap/inside/layout.ts#L26)

#### `MeasureFont` {#symbol-measurefont}
- Type: type
- Source: [source](../../../../../../../../../packages/explorer/src/client/views/worldMap/inside/layout.ts#L31)

##### `MeasureFont` — Summary
The fonts a card sets its words in, for measuring.

#### `Measure` {#symbol-measure}
- Type: type
- Source: [source](../../../../../../../../../packages/explorer/src/client/views/worldMap/inside/layout.ts#L32)
- Parameters: `font`: [`MeasureFont`](#symbol-measurefont)

#### `fallbackMeasure` {#symbol-fallbackmeasure}
- Type: const
- Source: [source](../../../../../../../../../packages/explorer/src/client/views/worldMap/inside/layout.ts#L36)
- Returns: [`Measure`](#symbol-measure)

#### `PlacedNode` {#symbol-placednode}
- Type: interface
- Source: [source](../../../../../../../../../packages/explorer/src/client/views/worldMap/inside/layout.ts#L38)

#### `PlacedWall` {#symbol-placedwall}
- Type: interface
- Source: [source](../../../../../../../../../packages/explorer/src/client/views/worldMap/inside/layout.ts#L49)
- Extends: [`InsideWall`](./model.ts.mdmd.md#symbol-insidewall)

#### `InsideLayout` {#symbol-insidelayout}
- Type: interface
- Source: [source](../../../../../../../../../packages/explorer/src/client/views/worldMap/inside/layout.ts#L54)

#### `layoutInside` {#symbol-layoutinside}
- Type: function
- Source: [source](../../../../../../../../../packages/explorer/src/client/views/worldMap/inside/layout.ts#L62)
- Returns: [`InsideLayout`](#symbol-insidelayout)
- Parameters: `model`: [`InsideModel`](./model.ts.mdmd.md#symbol-insidemodel); `measure`: [`Measure`](#symbol-measure)

##### `layoutInside` — Summary
Lays the folder map out in map pixels, each card as wide as its words.

#### `pinOf` {#symbol-pinof}
- Type: function
- Source: [source](../../../../../../../../../packages/explorer/src/client/views/worldMap/inside/layout.ts#L133)
- Parameters: `layout`: [`InsideLayout`](#symbol-insidelayout)

##### `pinOf` — Summary
Where a wire meets a node: at the row named, or the last row, on the left for a pin that takes or the right for one that gives.

#### `clamp` {#symbol-clamp}
- Type: function
- Source: [source](../../../../../../../../../packages/explorer/src/client/views/worldMap/inside/layout.ts#L145)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`model.InsideModel`](./model.ts.mdmd.md#symbol-insidemodel) (type-only)
- [`model.InsideWall`](./model.ts.mdmd.md#symbol-insidewall) (type-only)
<!-- LIVE-DOC:END Dependencies -->
