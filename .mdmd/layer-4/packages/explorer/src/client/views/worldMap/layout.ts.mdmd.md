# packages/explorer/src/client/views/worldMap/layout.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/worldMap/layout.ts
- Generated At: 2026-10-08T16:03:29.437Z

## Authored
### Purpose
The World Map's geometry, pure and tested: the solid each shape word is drawn as; a piece's box around its centre, floating above the board and lifted while dragged; the rectangle around some rectangles; board units to pixels and back; rows for the things nobody has placed, a region's members together; the wall of a piece that faces a counterpart among the walls the viewer sees, and the point on it where a door sits (on a drum, a point on the visible rim); the curve a wire hangs along between two doors; tokens pushed clear of the pieces and of each other; and the order to draw pieces in, far first.

### Notes
- Written on 2026-09-28 with the view ([Turn 46](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/09/Summarized/2026-09-27.1.SUMMARIZED.md#turn-46)). The numbers here are the picture's: one board unit is 60 pixels, a piece floats 46 above the board, the grid is 50. Nothing here touches the DOM; `controller.ts` draws what this returns and keeps the labels apart afterwards, since a label's box is only known once it is drawn.
- `solidFor` is reached through `placePiece` and by the tests; `UNIT` and `LIFT` are exported and read by nothing outside, kept as the names of the picture's units. Measured by `layout.test.ts`.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `UNIT` {#symbol-unit}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/layout.ts#L11)

##### `UNIT` — Summary
One board unit, the unit of a board's Layout lines, in board pixels.

#### `FLOAT` {#symbol-float}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/layout.ts#L13)

##### `FLOAT` — Summary
How high above the board a piece floats.

#### `LIFT` {#symbol-lift}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/layout.ts#L15)

##### `LIFT` — Summary
How much higher a piece floats while it is dragged.

#### `GRID` {#symbol-grid}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/layout.ts#L17)

##### `GRID` — Summary
The snapping grid, in board pixels.

#### `Shape` {#symbol-shape}
- Type: type
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/layout.ts#L20)

##### `Shape` — Summary
The shape words the legend may use; the tool ships a solid for each.

#### `Solid` {#symbol-solid}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/layout.ts#L23)

##### `Solid` — Summary
A solid: a block with a footprint and a height, or a round tank with a radius.

#### `solidFor` {#symbol-solidfor}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/layout.ts#L32)
- Returns: [`Solid`](#symbol-solid)
- Parameters: `shape`: [`Shape`](#symbol-shape)

##### `solidFor` — Summary
The solid drawn for a shape word.

#### `Placed` {#symbol-placed}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/layout.ts#L51)
- Extends: [`Box`](./projection.ts.mdmd.md#symbol-box)

##### `Placed` — Summary
A piece placed on the board, in board pixels.

#### `placePiece` {#symbol-placepiece}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/layout.ts#L61)
- Returns: [`Placed`](#symbol-placed)
- Parameters: `shape`: [`Shape`](#symbol-shape); `center`: [`Point2`](./projection.ts.mdmd.md#symbol-point2)

##### `placePiece` — Summary
A piece's box around its centre, floating, and lifted a little more while dragged.

#### `Rect` {#symbol-rect}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/layout.ts#L68)

##### `Rect` — Summary
A rectangle on the board.

#### `rectAround` {#symbol-rectaround}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/layout.ts#L76)
- Returns: [`Rect`](#symbol-rect)
- Parameters: `rects`: [`Rect`](#symbol-rect)[]

##### `rectAround` — Summary
The rectangle around some rectangles, with padding; nothing when there are none.

#### `corners` {#symbol-corners}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/layout.ts#L88)
- Returns: [`Point2`](./projection.ts.mdmd.md#symbol-point2)[]
- Parameters: `rect`: [`Rect`](#symbol-rect)

##### `corners` — Summary
The corners of a rectangle, clockwise from the top left.

#### `inRect` {#symbol-inrect}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/layout.ts#L93)
- Parameters: `rect`: [`Rect`](#symbol-rect); `point`: [`Point2`](./projection.ts.mdmd.md#symbol-point2)

##### `inRect` — Summary
Whether a board point lies in a rectangle.

#### `unitsToPixels` {#symbol-unitstopixels}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/layout.ts#L97)
- Returns: [`Point2`](./projection.ts.mdmd.md#symbol-point2)
- Parameters: `units`: [`Point2`](./projection.ts.mdmd.md#symbol-point2)

#### `pixelsToUnits` {#symbol-pixelstounits}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/layout.ts#L101)
- Returns: [`Point2`](./projection.ts.mdmd.md#symbol-point2)
- Parameters: `pixels`: [`Point2`](./projection.ts.mdmd.md#symbol-point2)

#### `PlacementGroup` {#symbol-placementgroup}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/layout.ts#L106)

##### `PlacementGroup` — Summary
A run of things to place together: the members of one region, or the things in none.

#### `autoPlace` {#symbol-autoplace}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/layout.ts#L115)
- Parameters: `groups`: [`PlacementGroup`](#symbol-placementgroup)[]; `placed`: `Iterable`

##### `autoPlace` — Summary
Positions, in board units, for things nobody has placed: each group on its
own rows below whatever is placed already, three units apart, with a spare
row between groups, so that a region's members sit together.

#### `Wall` {#symbol-wall}
- Type: type
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/layout.ts#L133)

##### `Wall` — Summary
A wall of a block, by its outward direction on the board.

#### `NORMALS` {#symbol-normals}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/layout.ts#L134)

#### `wallOf` {#symbol-wallof}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/layout.ts#L137)
- Returns: [`Wall`](#symbol-wall)
- Parameters: `camera`: [`Camera`](./projection.ts.mdmd.md#symbol-camera); `placed`: [`Placed`](#symbol-placed); `toward`: [`Point2`](./projection.ts.mdmd.md#symbol-point2)

##### `wallOf` — Summary
The wall that faces a counterpart best, among the walls the viewer can see.

#### `Anchor` {#symbol-anchor}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/layout.ts#L149)

##### `Anchor` — Summary
Where a door sits: a point at mid-height on the board, and the direction a wire leaves it.

#### `wallPoint` {#symbol-wallpoint}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/layout.ts#L155)
- Returns: [`Anchor`](#symbol-anchor)
- Parameters: `camera`: [`Camera`](./projection.ts.mdmd.md#symbol-camera); `placed`: [`Placed`](#symbol-placed); `wall`: [`Wall`](#symbol-wall); `toward`: [`Point2`](./projection.ts.mdmd.md#symbol-point2)

##### `wallPoint` — Summary
The point on a wall, at a fraction along it, where a door sits; on a drum, a point on the visible half of the rim facing the counterpart.

#### `roadCurve` {#symbol-roadcurve}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/layout.ts#L182)
- Parameters: `from`: [`Anchor`](#symbol-anchor); `to`: [`Anchor`](#symbol-anchor)

##### `roadCurve` — Summary
A wire between two doors: a cable in the air that hangs a little.

#### `spreadTokens` {#symbol-spreadtokens}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/layout.ts#L194)
- Returns: [`Point2`](./projection.ts.mdmd.md#symbol-point2)[]
- Parameters: `seeds`: [`Point2`](./projection.ts.mdmd.md#symbol-point2)[]; `obstacles`: [`Point2`](./projection.ts.mdmd.md#symbol-point2)[]; `bounds`: [`Rect`](#symbol-rect)

##### `spreadTokens` — Summary
Pushes each seed away from every obstacle and from the seeds placed before
it, within bounds, so that tokens on the board sit clear of the pieces and
of each other.

#### `drawOrder` {#symbol-draworder}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/layout.ts#L230)
- Returns: [`Placed`](#symbol-placed)[]
- Parameters: `camera`: [`Camera`](./projection.ts.mdmd.md#symbol-camera); `pivot`: [`Pivot`](./projection.ts.mdmd.md#symbol-pivot); `pieces`: [`Placed`](#symbol-placed)[]

##### `drawOrder` — Summary
The order to draw pieces in: far ones first.

#### `clamp` {#symbol-clamp}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/layout.ts#L234)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`projection.Box`](./projection.ts.mdmd.md#symbol-box)
- [`projection.Camera`](./projection.ts.mdmd.md#symbol-camera)
- [`projection.Pivot`](./projection.ts.mdmd.md#symbol-pivot)
- [`projection.Point2`](./projection.ts.mdmd.md#symbol-point2)
- [`projection.Point3`](./projection.ts.mdmd.md#symbol-point3)
- [`projection.depthOf`](./projection.ts.mdmd.md#symbol-depthof)
- [`projection.facing`](./projection.ts.mdmd.md#symbol-facing)
<!-- LIVE-DOC:END Dependencies -->
