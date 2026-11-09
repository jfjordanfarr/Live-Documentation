# packages/explorer/src/client/views/containedSphere.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/containedSphere.ts
- Generated At: 2026-11-09T00:01:54.723Z

## Authored
### Purpose
Draws contained-file spheres with the native Lambert look and true per-sample sphere depth, while preserving a native primitive on incompatible renderers.

### Notes
Current implementation, introduced November 8, 2026 while validating the owner's [Skin/one-hop defaults](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/Summarized/2026-11-07.1.SUMMARIZED.md#turn-2), with the investigation recorded in the [November 8 session](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-08.1.record.md). A matched repository generator-file view submitted 829 contained marks: removing the contained-file layer substantially improved held-pose cadence while physics used about 1.6 ms per frame. The per-sample prototype improved that held pose, but the normal generator-file arrival still missed its 60-second settling deadline; the static gain is not a convergence or availability guarantee. The accepted static prototype replaces only those contained-file meshes, keeping every mark, radius, transform, color, alpha and submitted back-to-front order. Ordinary nodes and picking remain native.

The projected rectangle conservatively bounds the off-axis silhouette; each actual MSAA sample intersects the front-facing sphere, obtains its Lambert normal and writes the true hit depth. It never substitutes a far intersection when the front surface is clipped or the camera is inside. This avoids the first quad prototype's hard silhouette without alpha smoothing or alpha-to-coverage, which would alter translucent blending or depth coverage. The shader reuses Three's Lambert chunks/uniforms under the current NoToneMapping and Linear-sRGB/sRGB output pipeline. Both sample-variable/interpolation extensions and that pipeline are required before material selection; unsupported contexts retain the original native sphere geometry and material.

Frozen perspective carriers use the submitted sphere parameters rather than bounding-quad corners. Near/far cuts share one immutable unit-sphere sampling template and preserve a front-surface hole through clipped polygons, filled as one path so triangle boundaries do not add alpha seams. Silhouettes retain offscreen geometry for the existing translation phases. Matched native high-resolution, shifted-lens, eye-plane, clipping and interleaved translucent-overlap comparisons established static fidelity; normal motion, availability and capture cost remain separate verification.

Before expanding a projected quad, the vertex shader rejects a sphere wholly outside any of the six projection planes, using the transformed full radius and a conservative float32 roundoff allowance. This matters for an off-axis sphere crossing the eye plane: an uncensored fallback rectangle covered the whole viewport even when every sample missed the sphere. Matched uploaded data at motion revision 250 found three such empty full-canvas covers. This rejection changes GPU work alone; the submitted instances and frozen carriers remain intact, and carrier projection still keeps offscreen sides so translation can bring them into view.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `containedSphereGeometry` {#symbol-containedspheregeometry}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/containedSphere.ts#L4)
- Returns: `PlaneGeometry`

##### `containedSphereGeometry` — Summary
Four submitted corners bound a sphere; its material draws the actual curved surface, never the rectangle.

#### `projectSphereBoundary` {#symbol-projectsphereboundary}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/containedSphere.ts#L12)
- Parameters: `camera`: `Camera`

##### `projectSphereBoundary` — Summary
Actual front-surface silhouette candidates, clipped only in depth; moving carriers retain offscreen geometry.

#### `projectSphereSurface` {#symbol-projectspheresurface}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/containedSphere.ts#L62)
- Parameters: `camera`: `Camera`

##### `projectSphereSurface` — Summary
A depth-cut sphere needs its front-surface polygons as well as its outer silhouette (for example, a near-plane annulus).

#### `supportsContainedSphereSamples` {#symbol-supportscontainedspheresamples}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/containedSphere.ts#L100)
- Parameters: `renderer`: `WebGLRenderer`

##### `supportsContainedSphereSamples` — Summary
Enable the actual per-sample interpolation needed to preserve native MSAA coverage and depth.

#### `containedSpherePrimitive` {#symbol-containedsphereprimitive}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/containedSphere.ts#L108)
- Parameters: `renderer`: `WebGLRenderer`

##### `containedSpherePrimitive` — Summary
Choose the compatible native primitive before any shader compilation on unsupported contexts.

#### `ContainedSphereMaterial` {#symbol-containedspherematerial}
- Type: class
- Source: [source](../../../../../../../packages/explorer/src/client/views/containedSphere.ts#L115)
- Extends: `RawShaderMaterial`

##### `ContainedSphereMaterial` — Summary
Lambert-lit analytic unit sphere, scaled uniformly by its uploaded instance matrix.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `three` - `Camera`, `GLSL3`, `LinearSRGBColorSpace`, `Matrix4`, `NoToneMapping`, `PlaneGeometry`, `RawShaderMaterial`, `SRGBColorSpace`, `ShaderChunk`, `ShaderLib`, `Sphere`, `SphereGeometry`, `UniformsUtils`, `Vector3`, `WebGLRenderer`
<!-- LIVE-DOC:END Dependencies -->
