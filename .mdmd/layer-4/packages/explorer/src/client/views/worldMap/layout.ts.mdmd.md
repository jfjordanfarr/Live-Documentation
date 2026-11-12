# packages/explorer/src/client/views/worldMap/layout.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/worldMap/layout.ts
- Generated At: 2026-11-12T21:56:27.391Z

## Authored
### Purpose
The World Map's geometry, pure and tested: the solid each shape word is drawn as; a piece's box around its centre, floating above the board and lifted while dragged; the rectangle around some rectangles; board units to pixels and back; rows for the things nobody has placed, a region's members together; the wall of a piece that faces a counterpart among the walls the viewer sees, and the point on it where a door sits (on a drum, a point on the visible rim); the curve a wire hangs along between two doors; tokens pushed clear of the pieces and of each other; the order to draw pieces in, far first; a piece's outline on the screen and the point above it where its label stands; the moves a label may make when something is in its way; how much of a box an outline covers; and where a panel about a piece stands, beside it rather than on it.

### Notes
- Written on 2026-09-28 with the view ([Turn 46](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/09/Summarized/2026-09-27.1.SUMMARIZED.md#turn-46)). The numbers here are the picture's: one board unit is 60 pixels, a piece floats 46 above the board, the grid is 50. Nothing here touches the DOM; `controller.ts` draws what this returns and keeps the labels apart afterwards, since a label's box is only known once it is drawn.
- `solidFor` is reached through `placePiece` and by the tests; `UNIT` and `LIFT` are exported and read by nothing outside, kept as the names of the picture's units. Measured by `layout.test.ts`.
- Since 2026-11-12 ([the first visit's finding 6](../../../../../../../../AI-Agent-Workspace/Screenshots/2026-11-12/first-visit/README.md), [the repair's evidence](../../../../../../../../AI-Agent-Workspace/Screenshots/2026-11-12/world-map-repairs/README.md)): `silhouette` is a piece's outline as drawn, the hull of its corners or of a drum's rims, and `labelAnchor` the top of it, over the piece's middle. Before, labels stood at the middle of the lid, and a piece's own edges struck through its words. `labelMoves` orders a label's moves fewest steps first, `coveredArea` measures how much of a label's box an outline covers, and the controller's label settling uses all three. `panelBeside` places a pinned piece's panel beside the piece, inside the room below the tools, covering the piece's wired neighbours as little as it can; before, the panel stood at the pointer, on the piece it explained.

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
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/layout.ts#L98)
- Returns: [`Point2`](./projection.ts.mdmd.md#symbol-point2)
- Parameters: `units`: [`Point2`](./projection.ts.mdmd.md#symbol-point2)

##### `unitsToPixels` — Summary
A board point in board units, as pixels on the plane.

#### `pixelsToUnits` {#symbol-pixelstounits}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/layout.ts#L103)
- Returns: [`Point2`](./projection.ts.mdmd.md#symbol-point2)
- Parameters: `pixels`: [`Point2`](./projection.ts.mdmd.md#symbol-point2)

##### `pixelsToUnits` — Summary
A point on the plane in pixels, as board units rounded to hundredths, which is how the Layout section writes them.

#### `PlacementGroup` {#symbol-placementgroup}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/layout.ts#L108)

##### `PlacementGroup` — Summary
A run of things to place together: the members of one region, or the things in none.

#### `autoPlace` {#symbol-autoplace}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/layout.ts#L117)
- Parameters: `groups`: [`PlacementGroup`](#symbol-placementgroup)[]; `placed`: `Iterable`

##### `autoPlace` — Summary
Positions, in board units, for things nobody has placed: each group on its
own rows below whatever is placed already, three units apart, with a spare
row between groups, so that a region's members sit together.

#### `Wall` {#symbol-wall}
- Type: type
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/layout.ts#L135)

##### `Wall` — Summary
A wall of a block, by its outward direction on the board.

#### `NORMALS` {#symbol-normals}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/layout.ts#L137)

##### `NORMALS` — Summary
Each wall's outward direction on the board plane.

#### `wallOf` {#symbol-wallof}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/layout.ts#L140)
- Returns: [`Wall`](#symbol-wall)
- Parameters: `camera`: [`Camera`](./projection.ts.mdmd.md#symbol-camera); `placed`: [`Placed`](#symbol-placed); `toward`: [`Point2`](./projection.ts.mdmd.md#symbol-point2)

##### `wallOf` — Summary
The wall that faces a counterpart best, among the walls the viewer can see.

#### `Anchor` {#symbol-anchor}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/layout.ts#L152)

##### `Anchor` — Summary
Where a door sits: a point at mid-height on the board, and the direction a wire leaves it.

#### `wallPoint` {#symbol-wallpoint}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/layout.ts#L158)
- Returns: [`Anchor`](#symbol-anchor)
- Parameters: `camera`: [`Camera`](./projection.ts.mdmd.md#symbol-camera); `placed`: [`Placed`](#symbol-placed); `wall`: [`Wall`](#symbol-wall); `toward`: [`Point2`](./projection.ts.mdmd.md#symbol-point2)

##### `wallPoint` — Summary
The point on a wall, at a fraction along it, where a door sits; on a drum, a point on the visible half of the rim facing the counterpart.

#### `roadCurve` {#symbol-roadcurve}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/layout.ts#L185)
- Parameters: `from`: [`Anchor`](#symbol-anchor); `to`: [`Anchor`](#symbol-anchor)

##### `roadCurve` — Summary
A wire between two doors: a cable in the air that hangs a little.

#### `spreadTokens` {#symbol-spreadtokens}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/layout.ts#L197)
- Returns: [`Point2`](./projection.ts.mdmd.md#symbol-point2)[]
- Parameters: `seeds`: [`Point2`](./projection.ts.mdmd.md#symbol-point2)[]; `obstacles`: [`Point2`](./projection.ts.mdmd.md#symbol-point2)[]; `bounds`: [`Rect`](#symbol-rect)

##### `spreadTokens` — Summary
Pushes each seed away from every obstacle and from the seeds placed before
it, within bounds, so that tokens on the board sit clear of the pieces and
of each other.

#### `drawOrder` {#symbol-draworder}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/layout.ts#L233)
- Returns: [`Placed`](#symbol-placed)[]
- Parameters: `camera`: [`Camera`](./projection.ts.mdmd.md#symbol-camera); `pivot`: [`Pivot`](./projection.ts.mdmd.md#symbol-pivot); `pieces`: [`Placed`](#symbol-placed)[]

##### `drawOrder` — Summary
The order to draw pieces in: far ones first.

#### `silhouette` {#symbol-silhouette}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/layout.ts#L242)
- Returns: [`Point2`](./projection.ts.mdmd.md#symbol-point2)[]
- Parameters: `camera`: [`Camera`](./projection.ts.mdmd.md#symbol-camera); `pivot`: [`Pivot`](./projection.ts.mdmd.md#symbol-pivot); `placed`: [`Placed`](#symbol-placed)

##### `silhouette` — Summary
A piece's outline on the picture plane: the convex hull of its corners, or of
a drum's two rims as they are drawn. Everything the piece's faces paint lies
inside it, so a label kept off it is kept off the piece.

#### `labelAnchor` {#symbol-labelanchor}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/layout.ts#L265)
- Returns: [`Point2`](./projection.ts.mdmd.md#symbol-point2)
- Parameters: `camera`: [`Camera`](./projection.ts.mdmd.md#symbol-camera); `pivot`: [`Pivot`](./projection.ts.mdmd.md#symbol-pivot); `placed`: [`Placed`](#symbol-placed)

##### `labelAnchor` — Summary
Where a piece's label stands, on the picture plane: over the piece's middle,
at the top of its outline. The label is drawn above this point, so however
wide its words are and however the camera turns, it never crosses its own
piece. Before 2026-11-12 labels stood on the middle of the lid, and a piece's
own edges struck through its words.

#### `LabelMove` {#symbol-labelmove}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/layout.ts#L274)

##### `LabelMove` — Summary
A move a label may make from where it rests: pixels up or down, a fraction of its own width sideways, and whether it
stands below its piece instead of above it.

#### `labelMoves` {#symbol-labelmoves}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/layout.ts#L284)
- Returns: [`LabelMove`](#symbol-labelmove)[]

##### `labelMoves` — Summary
The moves a label may make, every rise with every shift, fewest steps first, where a line of text up or down and a
quarter of the label's width aside each count as one step; moves as far as each other keep the order they were given.

#### `ScreenBox` {#symbol-screenbox}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/layout.ts#L290)

##### `ScreenBox` — Summary
A box on the screen, in pixels.

#### `coveredArea` {#symbol-coveredarea}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/layout.ts#L298)
- Parameters: `box`: [`ScreenBox`](#symbol-screenbox); `polygon`: [`Point2`](./projection.ts.mdmd.md#symbol-point2)[]

##### `coveredArea` — Summary
How much of a box a convex polygon covers, in square pixels.

#### `Avoid` {#symbol-avoid}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/layout.ts#L335)

##### `Avoid` — Summary
Something a panel had better not cover, and what covering it costs.

#### `panelBeside` {#symbol-panelbeside}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/layout.ts#L347)
- Parameters: `subject`: [`ScreenBox`](#symbol-screenbox); `room`: [`ScreenBox`](#symbol-screenbox); `avoid`: [`Avoid`](#symbol-avoid)[]

##### `panelBeside` — Summary
Where a panel about something stands, on the screen: beside it rather than on
it. It tries the right of the subject, then the left, below and above, each
held inside the room it has, and takes the first that covers the subject
least, then what it is asked to avoid least. Before 2026-11-12 the pinned
panel stood at the pointer, on the piece it explained.

#### `clamp` {#symbol-clamp}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/layout.ts#L402)

##### `clamp` — Summary
The value held within the bounds.
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
- [`projection.project`](./projection.ts.mdmd.md#symbol-project)
- [`projection.ring`](./projection.ts.mdmd.md#symbol-ring)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
