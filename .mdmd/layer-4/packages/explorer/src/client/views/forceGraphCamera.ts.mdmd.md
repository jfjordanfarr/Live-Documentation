# packages/explorer/src/client/views/forceGraphCamera.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/forceGraphCamera.ts
- Generated At: 2026-10-02T21:07:39.335Z

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

#### `screenAnchorTranslation` {#symbol-screenanchortranslation}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphCamera.ts#L26)
- Returns: `Vector3`
- Parameters: `camera`: [`Camera`](./worldMap/projection.ts.mdmd.md#symbol-camera); `point`: [`CameraPoint`](#symbol-camerapoint)

##### `screenAnchorTranslation` — Summary
Translate a camera and its target together to place a world point at a normalized screen anchor.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `three` - `Camera`, `Vector3`
<!-- LIVE-DOC:END Dependencies -->
