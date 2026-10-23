# packages/explorer/src/client/views/forceGraphCamera.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/forceGraphCamera.ts
- Generated At: 2026-10-23T21:48:48.041Z

## Authored
### Purpose
Computes neighbourhood and directory framing, screen anchoring and wheel zoom while preserving the viewer's orientation in the spatial Local Map.

### Notes
The direction is measured from the camera’s current target, so panned views and nodes at the world origin work without special assumptions about node distance. A coincident camera and target use the positive Z direction.

Scope framing centers the actual member bounds, or keeps an explicitly requested file at the target and fits the complete sphere bodies within a padded perspective frustum, preserving the camera bearing. The installed renderer's general fit operation instead targets the world origin; visual checking of a distant directory during [the October 14 pin-management work](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-11--pin-management-approved-ancestor-disclosure-and-directory-hubs) exposed why it could not supply this behavior. The pure calculation covers groups away from the origin and tilted views.

Wheel zoom scales the camera and its target together around the inspected point, preserving that point's projection. Its distance bounds must never reverse a gesture: native middle-button zoom can already have moved inside the wheel's minimum, so an inward wheel gesture stays there rather than snapping outward. The owner's [October 13 review](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-7--owner-review-of-alignment-and-motion) exposed the need to test those input methods together.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `CameraPoint` {#symbol-camerapoint}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphCamera.ts#L4)

##### `CameraPoint` — Summary
A position in the Force Graph's world coordinate system.

#### `CameraSphere` {#symbol-camerasphere}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphCamera.ts#L7)

##### `CameraSphere` — Summary
A visible body whose full extent must fit when a file or scope receives focus.

#### `frameCameraSpheres` {#symbol-framecameraspheres}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphCamera.ts#L13)
- Parameters: `camera`: `PerspectiveCamera`; `subject`: [`CameraPoint`](#symbol-camerapoint)

##### `frameCameraSpheres` — Summary
Frame a group about its own center or an explicit subject, preserving the camera bearing and allowing for sphere radii and viewport padding.

#### `focusedCameraPosition` {#symbol-focusedcameraposition}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphCamera.ts#L49)
- Returns: [`CameraPoint`](#symbol-camerapoint)
- Parameters: `camera`: [`CameraPoint`](#symbol-camerapoint); `lookingAt`: [`CameraPoint`](#symbol-camerapoint); `node`: [`CameraPoint`](#symbol-camerapoint)

##### `focusedCameraPosition` — Summary
Move toward a file without changing the direction from which the person is looking.

#### `wheelZoomCamera` {#symbol-wheelzoomcamera}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphCamera.ts#L68)
- Parameters: `camera`: [`CameraPoint`](#symbol-camerapoint); `target`: [`CameraPoint`](#symbol-camerapoint); `point`: [`CameraPoint`](#symbol-camerapoint)

##### `wheelZoomCamera` — Summary
Zoom around the inspected point, keeping its screen position and never reversing direction at a distance limit.

#### `screenAnchorTranslation` {#symbol-screenanchortranslation}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphCamera.ts#L85)
- Returns: `Vector3`
- Parameters: `camera`: [`Camera`](./worldMap/projection.ts.mdmd.md#symbol-camera); `point`: [`CameraPoint`](#symbol-camerapoint)

##### `screenAnchorTranslation` — Summary
Translate a camera and its target together to place a world point at a normalized screen anchor.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `three` - `Box3`, `Camera`, `PerspectiveCamera`, `Vector3`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
