# packages/explorer/src/client/views/worldMap/controller.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/worldMap/controller.ts
- Generated At: 2026-10-02T22:31:59.222Z

## Authored
### Purpose
_Pending authored purpose_

### Notes
_Pending notes_

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Hover` {#symbol-hover}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/controller.ts#L65)

##### `Hover` — Summary
What the pointer is on.

#### `WorldMapOptions` {#symbol-worldmapoptions}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/controller.ts#L70)

#### `WorldMapController` {#symbol-worldmapcontroller}
- Type: class
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/controller.ts#L142)

##### `WorldMapController` — Summary
Draws a board and answers the pointer.

#### `WorldMapApi` {#symbol-worldmapapi}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/controller.ts#L1597)

##### `WorldMapApi` — Summary
The handle a test or a screenshot script drives, at `window.__worldMap`.

#### `NORMALS` {#symbol-normals}
- Type: unknown
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/controller.ts#L1681)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Board`](../../../../../engine/src/live-docs/board.ts.mdmd.md#symbol-board)
- [`board.renderBoard`](../../../../../engine/src/live-docs/board.ts.mdmd.md#symbol-renderboard)
- [`graph.LiveDocGraph`](../../../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph) (type-only)
- [`layout.Anchor`](./layout.ts.mdmd.md#symbol-anchor)
- [`layout.FLOAT`](./layout.ts.mdmd.md#symbol-float)
- [`layout.GRID`](./layout.ts.mdmd.md#symbol-grid)
- [`layout.NORMALS`](./layout.ts.mdmd.md#symbol-normals)
- [`layout.Placed`](./layout.ts.mdmd.md#symbol-placed)
- [`layout.Rect`](./layout.ts.mdmd.md#symbol-rect)
- [`layout.Wall`](./layout.ts.mdmd.md#symbol-wall)
- [`layout.autoPlace`](./layout.ts.mdmd.md#symbol-autoplace)
- [`layout.clamp`](./layout.ts.mdmd.md#symbol-clamp)
- [`layout.corners`](./layout.ts.mdmd.md#symbol-corners)
- [`layout.drawOrder`](./layout.ts.mdmd.md#symbol-draworder)
- [`layout.inRect`](./layout.ts.mdmd.md#symbol-inrect)
- [`layout.pixelsToUnits`](./layout.ts.mdmd.md#symbol-pixelstounits)
- [`layout.placePiece`](./layout.ts.mdmd.md#symbol-placepiece)
- [`layout.rectAround`](./layout.ts.mdmd.md#symbol-rectaround)
- [`layout.roadCurve`](./layout.ts.mdmd.md#symbol-roadcurve)
- [`layout.spreadTokens`](./layout.ts.mdmd.md#symbol-spreadtokens)
- [`layout.unitsToPixels`](./layout.ts.mdmd.md#symbol-unitstopixels)
- [`layout.wallOf`](./layout.ts.mdmd.md#symbol-wallof)
- [`layout.wallPoint`](./layout.ts.mdmd.md#symbol-wallpoint)
- [`model.Tint`](./model.ts.mdmd.md#symbol-tint)
- [`model.WorldModel`](./model.ts.mdmd.md#symbol-worldmodel)
- [`model.WorldRoad`](./model.ts.mdmd.md#symbol-worldroad)
- [`model.regionsOf`](./model.ts.mdmd.md#symbol-regionsof)
- [`projection.Camera`](./projection.ts.mdmd.md#symbol-camera)
- [`projection.MIN_ELEVATION`](./projection.ts.mdmd.md#symbol-min_elevation)
- [`projection.Pivot`](./projection.ts.mdmd.md#symbol-pivot)
- [`projection.Point2`](./projection.ts.mdmd.md#symbol-point2)
- [`projection.Point3`](./projection.ts.mdmd.md#symbol-point3)
- [`projection.REST_ELEVATION`](./projection.ts.mdmd.md#symbol-rest_elevation)
- [`projection.Screen`](./projection.ts.mdmd.md#symbol-screen)
- [`projection.TOP_DOWN`](./projection.ts.mdmd.md#symbol-top_down)
- [`projection.bezierAt`](./projection.ts.mdmd.md#symbol-bezierat)
- [`projection.cuboidFaces`](./projection.ts.mdmd.md#symbol-cuboidfaces)
- [`projection.depthOf`](./projection.ts.mdmd.md#symbol-depthof)
- [`projection.fitScreen`](./projection.ts.mdmd.md#symbol-fitscreen)
- [`projection.fromScreen`](./projection.ts.mdmd.md#symbol-fromscreen)
- [`projection.isTopDown`](./projection.ts.mdmd.md#symbol-istopdown)
- [`projection.pointInPolygon`](./projection.ts.mdmd.md#symbol-pointinpolygon)
- [`projection.project`](./projection.ts.mdmd.md#symbol-project)
- [`projection.ring`](./projection.ts.mdmd.md#symbol-ring)
- [`projection.shade`](./projection.ts.mdmd.md#symbol-shade)
- [`projection.smooth`](./projection.ts.mdmd.md#symbol-smooth)
- [`projection.toScreen`](./projection.ts.mdmd.md#symbol-toscreen)
- [`projection.unproject`](./projection.ts.mdmd.md#symbol-unproject)
- [`projection.zoomAt`](./projection.ts.mdmd.md#symbol-zoomat)
<!-- LIVE-DOC:END Dependencies -->
