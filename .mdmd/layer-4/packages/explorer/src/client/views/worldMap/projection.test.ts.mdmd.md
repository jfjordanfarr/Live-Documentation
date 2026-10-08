# packages/explorer/src/client/views/worldMap/projection.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/views/worldMap/projection.test.ts
- Generated At: 2026-09-28T23:04:10.152Z

## Authored
### Purpose
Keeps the camera honest: a board point projects and unprojects through every azimuth and elevation tried; a point rises on the picture as it rises off the board, and never when seen from straight above; nearer is deeper, so it draws later; the board's corners fit the viewport with room around them; a zoom keeps the point under the pointer still and stays within its limits; top-down is known; the top of a solid is lit brightest, the underside darkest, the walls between; a box's faces sort far to near with the top last from above; a Bezier runs from its first point to its last; and inside is told from outside a polygon.

### Notes
- Written on 2026-09-28 with the view ([Turn 46](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/09/Summarized/2026-09-27.1.SUMMARIZED.md#turn-46)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`projection.REST_ELEVATION`](./projection.ts.mdmd.md#symbol-rest_elevation)
- [`projection.TOP_DOWN`](./projection.ts.mdmd.md#symbol-top_down)
- [`projection.bezierAt`](./projection.ts.mdmd.md#symbol-bezierat)
- [`projection.cuboidFaces`](./projection.ts.mdmd.md#symbol-cuboidfaces)
- [`projection.depthOf`](./projection.ts.mdmd.md#symbol-depthof)
- [`projection.fitScreen`](./projection.ts.mdmd.md#symbol-fitscreen)
- [`projection.fromScreen`](./projection.ts.mdmd.md#symbol-fromscreen)
- [`projection.isTopDown`](./projection.ts.mdmd.md#symbol-istopdown)
- [`projection.pointInPolygon`](./projection.ts.mdmd.md#symbol-pointinpolygon)
- [`projection.project`](./projection.ts.mdmd.md#symbol-project)
- [`projection.shade`](./projection.ts.mdmd.md#symbol-shade)
- [`projection.toScreen`](./projection.ts.mdmd.md#symbol-toscreen)
- [`projection.unproject`](./projection.ts.mdmd.md#symbol-unproject)
- [`projection.zoomAt`](./projection.ts.mdmd.md#symbol-zoomat)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
