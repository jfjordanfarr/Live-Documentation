# tests/e2e/contained-sphere-reference.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/contained-sphere-reference.ts
- Generated At: 2026-11-09T00:01:56.340Z

## Authored
### Purpose
Supplies independent native-rendering and framebuffer observations for contained-file browser regressions.

### Notes
Current test instrument, introduced with the November 8 actual-GPU regressions ([session record](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-08.1.record.md)). It reads the renderer and uploaded buffers through the existing observation seam. It does not import the contained-sphere shader, frozen capture or their projection helpers. Three's own Frustum supplies side-plane intersection cases; independently constructed native sphere geometry and the existing native Lambert material provide the rendered oracle. Explicit SphereGeometry and MeshLambertMaterial guards prevent a future ordinary-node optimization from silently changing that oracle. Supported rendering is compared with a high-resolution native surface; compatibility rendering must match the original twelve-segment native primitive exactly. Edge bands come from native framebuffer masks, including each overlapping instance's own rim. All temporary matrices, colors, alpha, visibility, camera and reference geometry are restored synchronously between application frames.

The clipping instrument changes only the camera near plane and finds an enclosed nine-pixel hole plus three distinct target-colored rim probes in actual GPU pixels. It removes the target from the submitted prefix to check that those probes do not belong to another mark. An opaque reference drawing of the selected uploaded skin provides its lower boundary; all of that skin's vertices must be in front of the eye and inside the viewport sides, so raster clipping cannot replace the full projected boundary. This provides carrier probe positions independently of the production projector. These controlled reference pictures are test inputs, not changes to application scope, picking, physics or content budgets.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `compareContainedRendering` {#symbol-comparecontainedrendering}
- Type: function
- Source: [source](../../../../tests/e2e/contained-sphere-reference.ts#L9)
- Parameters: `page`: `Page`

##### `compareContainedRendering` — Summary
Native Three geometry and the actual Lambert renderer independently grade the submitted contained primitive.

#### `clippedContainedMark` {#symbol-clippedcontainedmark}
- Type: function
- Source: [source](../../../../tests/e2e/contained-sphere-reference.ts#L127)
- Parameters: `page`: `Page`

##### `clippedContainedMark` — Summary
Observe a real clipped mark and its skin in the framebuffer, independently of frozen-carrier projection.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page` (type-only)
- `three` - `BufferGeometry`, `Frustum`, `InstancedMesh`, `Material`, `Matrix4`, `Mesh`, `PerspectiveCamera`, `Scene`, `SphereGeometry`, `Vector3`, `WebGLRenderer`
<!-- LIVE-DOC:END Dependencies -->
