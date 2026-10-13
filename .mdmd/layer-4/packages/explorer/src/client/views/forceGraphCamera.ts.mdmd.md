# packages/explorer/src/client/views/forceGraphCamera.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/forceGraphCamera.ts
- Generated At: 2026-10-13T22:20:23.636Z

## Authored
### Purpose
Computes file focus, screen anchoring and wheel zoom while preserving the viewer's orientation in the spatial Local Map.

### Notes
The direction is measured from the camera’s current target, so panned views and nodes at the world origin work without special assumptions about node distance. A coincident camera and target use the positive Z direction.

Wheel zoom scales the camera and its target together around the inspected point, preserving that point's projection. Its distance bounds must never reverse a gesture: native middle-button zoom can already have moved inside the wheel's minimum, so an inward wheel gesture stays there rather than snapping outward. The owner's [October 13 review](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-7--owner-review-of-alignment-and-motion) exposed the need to test those input methods together.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `CameraPoint` {#symbol-camerapoint}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphCamera.ts#L4)

##### `CameraPoint` — Summary
A position in the Force Graph's world coordinate system.

#### `focusedCameraPosition` {#symbol-focusedcameraposition}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphCamera.ts#L7)
- Returns: [`CameraPoint`](#symbol-camerapoint)
- Parameters: `camera`: [`CameraPoint`](#symbol-camerapoint); `lookingAt`: [`CameraPoint`](#symbol-camerapoint); `node`: [`CameraPoint`](#symbol-camerapoint)

##### `focusedCameraPosition` — Summary
Move toward a file without changing the direction from which the person is looking.

#### `wheelZoomCamera` {#symbol-wheelzoomcamera}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphCamera.ts#L26)
- Parameters: `camera`: [`CameraPoint`](#symbol-camerapoint); `target`: [`CameraPoint`](#symbol-camerapoint); `point`: [`CameraPoint`](#symbol-camerapoint)

##### `wheelZoomCamera` — Summary
Zoom around the inspected point, keeping its screen position and never reversing direction at a distance limit.

#### `screenAnchorTranslation` {#symbol-screenanchortranslation}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphCamera.ts#L43)
- Returns: `Vector3`
- Parameters: `camera`: [`Camera`](./worldMap/projection.ts.mdmd.md#symbol-camera); `point`: [`CameraPoint`](#symbol-camerapoint)

##### `screenAnchorTranslation` — Summary
Translate a camera and its target together to place a world point at a normalized screen anchor.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `three` - `Camera`, `Vector3`
<!-- LIVE-DOC:END Dependencies -->
