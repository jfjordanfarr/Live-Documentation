# packages/explorer/src/client/views/forceGraphCamera.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/forceGraphCamera.ts
- Generated At: 2026-10-02T15:42:29.711Z

## Authored
### Purpose
Computes a camera position that approaches a selected file while preserving the current viewing direction.

### Notes
The direction is measured from the camera’s current target, so panned views and nodes at the world origin work without special assumptions about node distance. A coincident camera and target use the positive Z direction.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `CameraPoint` {#symbol-camerapoint}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphCamera.ts#L2)

##### `CameraPoint` — Summary
A position in the Force Graph's world coordinate system.

#### `focusedCameraPosition` {#symbol-focusedcameraposition}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphCamera.ts#L5)
- Returns: [`CameraPoint`](#symbol-camerapoint)
- Parameters: `camera`: [`CameraPoint`](#symbol-camerapoint); `lookingAt`: [`CameraPoint`](#symbol-camerapoint); `node`: [`CameraPoint`](#symbol-camerapoint)

##### `focusedCameraPosition` — Summary
Move toward a file without changing the direction from which the person is looking.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
