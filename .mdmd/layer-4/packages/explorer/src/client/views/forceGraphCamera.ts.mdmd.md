# packages/explorer/src/client/views/forceGraphCamera.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/forceGraphCamera.ts
- Generated At: 2026-11-11T09:13:25.891Z

## Authored
### Purpose
Computes neighbourhood and directory framing, screen anchoring and wheel zoom while preserving the viewer's orientation in the spatial Local Map.

### Notes
The direction is measured from the camera’s current target, so panned views and nodes at the world origin work without special assumptions about node distance. A coincident camera and target use the positive Z direction.

Scope framing centers the actual member bounds, or keeps an explicitly requested file at the target and fits the complete sphere bodies within a padded perspective frustum, preserving the camera bearing. The installed renderer's general fit operation instead targets the world origin; visual checking of a distant directory during [the October 14 pin-management work](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-11--pin-management-approved-ancestor-disclosure-and-directory-hubs) exposed why it could not supply this behavior. The pure calculation covers groups away from the origin and tilted views. It scans coordinates directly rather than allocating intermediate vectors for each member, so following a large scope does not create an allocation stream on every frame.

Wheel zoom scales the camera and its target together around the inspected point, preserving that point's projection. Its distance bounds must never reverse a gesture: native middle-button zoom can already have moved inside the wheel's minimum, so an inward wheel gesture stays there rather than snapping outward. The owner's [October 13 review](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-7--owner-review-of-alignment-and-motion) exposed the need to test those input methods together.

`cornerPanelInsets` decides what a panel in the picture's top left corner takes from the camera's room: the room beside it while 320 px of width remain there, and otherwise the room above its lower edge, so that the picture is framed below the panel and never under it. It was written on 2026-11-11 ([Turn 6 of the November 10 record](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-10.1.record.md#turn-6)), when the history's step panel became a few lines high at the owner's word. Before it the view framed the picture beside the panel and, where fewer than 240 px remained there, ignored the panel, which the tall panel survived only because it was hidden first. The root's first rule took whichever room had the larger area; on this repository's root Structure picture, which is taller than it is wide, that drew the bubbles a fifth smaller (about 230 by 350 px for 290 by 430) in the lower room, 646 px high for 773, and was replaced the same hour. A rule that framed each picture in whichever room draws it larger would also serve wide pictures; it needs the picture's extents each frame and a way not to flip between rooms while the picture moves, and is not built.

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

#### `cornerPanelInsets` {#symbol-cornerpanelinsets}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphCamera.ts#L73)

##### `cornerPanelInsets` — Summary
What a panel standing in the picture's top left corner takes from the camera's room (2026-11-11): the room beside it,
as the view has always framed the picture, while that leaves the picture `least` pixels of width; where it does not,
the room above the panel's lower edge, so that the picture is framed below the panel and never under it. The history's
step panel was as tall as the picture, and where nothing was left beside it the panel was hidden or the picture drawn
under it; a few lines high since this date, it can stand above the picture instead. The room beside is kept wherever
it serves because it is the taller one: a picture as tall as it is wide is drawn larger there than below (measured on
this repository's root Structure picture, which a rule by the larger area had drawn a fifth smaller). `room` is the
picture's room before the panel, `panel` the panel's right and bottom edges within it.

#### `focusedCameraPosition` {#symbol-focusedcameraposition}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphCamera.ts#L79)
- Returns: [`CameraPoint`](#symbol-camerapoint)
- Parameters: `camera`: [`CameraPoint`](#symbol-camerapoint); `lookingAt`: [`CameraPoint`](#symbol-camerapoint); `node`: [`CameraPoint`](#symbol-camerapoint)

##### `focusedCameraPosition` — Summary
Move toward a file without changing the direction from which the person is looking.

#### `wheelZoomCamera` {#symbol-wheelzoomcamera}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphCamera.ts#L98)
- Parameters: `camera`: [`CameraPoint`](#symbol-camerapoint); `target`: [`CameraPoint`](#symbol-camerapoint); `point`: [`CameraPoint`](#symbol-camerapoint)

##### `wheelZoomCamera` — Summary
Zoom around the inspected point, keeping its screen position and never reversing direction at a distance limit.

#### `screenAnchorTranslation` {#symbol-screenanchortranslation}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphCamera.ts#L115)
- Returns: `Vector3`
- Parameters: `camera`: `Camera`; `point`: [`CameraPoint`](#symbol-camerapoint)

##### `screenAnchorTranslation` — Summary
Translate a camera and its target together to place a world point at a normalized screen anchor.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `three` - `Camera`, `PerspectiveCamera`, `Vector3`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
