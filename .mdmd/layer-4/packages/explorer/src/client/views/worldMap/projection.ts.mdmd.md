# packages/explorer/src/client/views/worldMap/projection.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/worldMap/projection.ts
- Generated At: 2026-10-02T22:33:03.808Z

## Authored
### Purpose
_Pending authored purpose_

### Notes
_Pending notes_

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Camera` {#symbol-camera}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/projection.ts#L12)

##### `Camera` — Summary
Where the camera looks from: an azimuth about the pivot and an elevation above the board, in radians.

#### `Pivot` {#symbol-pivot}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/projection.ts#L18)

##### `Pivot` — Summary
The board point the camera turns about.

#### `Screen` {#symbol-screen}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/projection.ts#L24)

##### `Screen` — Summary
Pan and zoom applied to the projected picture, in screen pixels.

#### `Viewport` {#symbol-viewport}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/projection.ts#L30)

#### `Point3` {#symbol-point3}
- Type: type
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/projection.ts#L35)

#### `Point2` {#symbol-point2}
- Type: type
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/projection.ts#L36)

#### `REST_ELEVATION` {#symbol-rest_elevation}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/projection.ts#L39)

##### `REST_ELEVATION` — Summary
The elevation the board is seen at when nothing has moved it.

#### `MIN_ELEVATION` {#symbol-min_elevation}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/projection.ts#L41)

##### `MIN_ELEVATION` — Summary
The lowest the camera may go; below it the board is a line.

#### `TOP_DOWN` {#symbol-top_down}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/projection.ts#L43)

##### `TOP_DOWN` — Summary
Straight down: the board is a plain two-dimensional canvas.

#### `rotate` {#symbol-rotate}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/projection.ts#L48)
- Returns: [`Point2`](#symbol-point2)
- Parameters: `camera`: [`Camera`](#symbol-camera); `pivot`: [`Pivot`](#symbol-pivot)

##### `rotate` — Summary
A board point turned about the pivot by the camera's azimuth.

#### `unrotate` {#symbol-unrotate}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/projection.ts#L57)
- Returns: [`Point2`](#symbol-point2)
- Parameters: `camera`: [`Camera`](#symbol-camera); `pivot`: [`Pivot`](#symbol-pivot)

##### `unrotate` — Summary
The inverse of {@link rotate}.

#### `project` {#symbol-project}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/projection.ts#L66)
- Returns: [`Point2`](#symbol-point2)
- Parameters: `camera`: [`Camera`](#symbol-camera); `pivot`: [`Pivot`](#symbol-pivot)

##### `project` — Summary
A board point, at height z, on the picture plane.

#### `depthOf` {#symbol-depthof}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/projection.ts#L72)
- Parameters: `camera`: [`Camera`](#symbol-camera); `pivot`: [`Pivot`](#symbol-pivot)

##### `depthOf` — Summary
How near the camera a board point is; larger is nearer, so a larger depth draws later.

#### `unproject` {#symbol-unproject}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/projection.ts#L78)
- Returns: [`Point2`](#symbol-point2)
- Parameters: `camera`: [`Camera`](#symbol-camera); `pivot`: [`Pivot`](#symbol-pivot)

##### `unproject` — Summary
A picture-plane point back onto the board plane.

#### `toScreen` {#symbol-toscreen}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/projection.ts#L85)
- Returns: [`Point2`](#symbol-point2)
- Parameters: `screen`: [`Screen`](#symbol-screen); `point`: [`Point2`](#symbol-point2)

##### `toScreen` — Summary
A picture-plane point on the screen.

#### `fromScreen` {#symbol-fromscreen}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/projection.ts#L90)
- Returns: [`Point2`](#symbol-point2)
- Parameters: `screen`: [`Screen`](#symbol-screen)

##### `fromScreen` — Summary
A screen point on the picture plane.

#### `fitScreen` {#symbol-fitscreen}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/projection.ts#L95)
- Returns: [`Screen`](#symbol-screen)
- Parameters: `camera`: [`Camera`](#symbol-camera); `pivot`: [`Pivot`](#symbol-pivot); `corners`: [`Point2`](#symbol-point2)[]; `viewport`: [`Viewport`](#symbol-viewport)

##### `fitScreen` — Summary
The pan and zoom that shows every given board point with a margin, room for labels above and shadows below.

#### `zoomAt` {#symbol-zoomat}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/projection.ts#L108)
- Returns: [`Screen`](#symbol-screen)
- Parameters: `screen`: [`Screen`](#symbol-screen)

##### `zoomAt` — Summary
The pan and zoom after zooming by a factor about a screen point, within limits.

#### `isTopDown` {#symbol-istopdown}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/projection.ts#L115)
- Parameters: `camera`: [`Camera`](#symbol-camera)

##### `isTopDown` — Summary
Whether the camera looks straight down.

#### `facing` {#symbol-facing}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/projection.ts#L120)
- Parameters: `camera`: [`Camera`](#symbol-camera); `normal`: [`Point2`](#symbol-point2)

##### `facing` — Summary
Whether the viewer sees a wall with this outward normal on the board plane.

#### `shade` {#symbol-shade}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/projection.ts#L127)
- Parameters: `camera`: [`Camera`](#symbol-camera); `normal`: [`Point3`](#symbol-point3)

##### `shade` — Summary
How light a face with this normal is, from a light that sits off the front-left of the board: 0 dark to 1 light.

#### `Box` {#symbol-box}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/projection.ts#L142)

##### `Box` — Summary
A box on the board: its top-left corner, its footprint, the height it floats at and its own height.

#### `Face` {#symbol-face}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/projection.ts#L152)

##### `Face` — Summary
One face of a solid: its corners, its outward normal and its depth.

#### `cuboidFaces` {#symbol-cuboidfaces}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/projection.ts#L159)
- Returns: [`Face`](#symbol-face)[]
- Parameters: `camera`: [`Camera`](#symbol-camera); `pivot`: [`Pivot`](#symbol-pivot); `box`: [`Box`](#symbol-box)

##### `cuboidFaces` — Summary
The six faces of a box, sorted far to near, so that drawing them in order paints the visible ones last.

#### `ring` {#symbol-ring}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/projection.ts#L180)
- Returns: [`Point3`](#symbol-point3)[]

##### `ring` — Summary
The points of a circle on the board at a height, for a drum.

#### `bezierAt` {#symbol-bezierat}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/projection.ts#L188)
- Returns: [`Point3`](#symbol-point3)

##### `bezierAt` — Summary
A cubic Bezier through four points at a parameter.

#### `pointInPolygon` {#symbol-pointinpolygon}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/projection.ts#L194)
- Parameters: `polygon`: [`Point2`](#symbol-point2)[]; `point`: [`Point2`](#symbol-point2)

##### `pointInPolygon` — Summary
Whether a point lies inside a polygon, by ray casting.

#### `smooth` {#symbol-smooth}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/projection.ts#L207)

##### `smooth` — Summary
A smooth step from 0 to 1.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
