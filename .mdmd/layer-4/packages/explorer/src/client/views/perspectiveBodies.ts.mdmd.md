# packages/explorer/src/client/views/perspectiveBodies.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/perspectiveBodies.ts
- Generated At: 2026-11-11T06:51:22.010Z

## Authored
### Purpose
Projects frozen submitted skin meshes and interior instances into finite 2D carriers for the Local Map perspective transition.

### Notes
Current projection code, introduced November 8, 2026 when delivering the owner's [Skin/one-hop defaults](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/Summarized/2026-11-07.1.SUMMARIZED.md#turn-2) exposed directory identities missing from the transition ([implementation and review](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/Summarized/2026-11-08.1.SUMMARIZED.md#turn-1)). It reads a detached copy of the actual submitted geometry, transforms and draw state, never body packing or hidden contents. Triangles are clipped against near and far planes before perspective division; viewport sides remain intact so a translated carrier can enter the frame. Convex silhouettes retain the actual projected skin and sphere meshes. A center on the camera plane uses the projected bounds as a coordinate origin only; the outline coordinates do not move. The same frozen vectors are translated during the existing phases, with no second layout or per-frame projection. Draw kind, native ordering, alpha, veils and nested identity remain attached to the supplied marks.

Since November 8, 2026 analytic contained spheres project their actual primitive parameters, not the rectangle submitted for ray intersection. A near/far depth cut also carries front-surface polygons, preserving a near-plane hole; the transition fills their union as one path to avoid per-triangle alpha seams.

Native fallback files also retain their uploaded FrontSide semantics. When depth clipping cuts that actual sphere mesh, projected front-facing triangle polygons preserve its hole and faceted rim; a convex hull alone would fill the absent cap. Fully clipped front faces and an eye inside the sphere contribute no file carrier.
Since 2026-11-11 ([Turn 6 of the November 10 record](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-10.1.record.md#turn-6)) a frozen skin and a frozen interior unit carry `lit` when the step of the history shown lit them, and the projection passes it through, so that the 2D/3D fold draws them as they were drawn.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `FrozenBodyMesh` {#symbol-frozenbodymesh}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/perspectiveBodies.ts#L7)

##### `FrozenBodyMesh` — Summary
A copied mesh and transform from the last submitted spatial picture.

#### `FrozenBodyUnit` {#symbol-frozenbodyunit}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/perspectiveBodies.ts#L14)
- Extends: [`FrozenBodyMesh`](#symbol-frozenbodymesh)

##### `FrozenBodyUnit` — Summary
One actually submitted interior instance; hidden contents are never reconstructed.

#### `FrozenSpatialBody` {#symbol-frozenspatialbody}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/perspectiveBodies.ts#L32)
- Extends: [`FrozenBodyMesh`](#symbol-frozenbodymesh)

##### `FrozenSpatialBody` — Summary
A submitted skin and only the interior marks its drawn budget allowed.

#### `SceneBody` {#symbol-scenebody}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/perspectiveBodies.ts#L46)

##### `SceneBody` — Summary
A frozen projection in CSS pixels, each outline relative to the body's projected center.

#### `projectSpatialBodies` {#symbol-projectspatialbodies}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/perspectiveBodies.ts#L129)
- Parameters: `camera`: `Camera`

##### `projectSpatialBodies` — Summary
Project submitted geometry once; animation only translates the frozen outlines.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`containedSphere.projectSphereSurface`](./containedSphere.ts.mdmd.md#symbol-projectspheresurface)
- [`perspectiveGeometry.TransitionPoint`](./perspectiveGeometry.ts.mdmd.md#symbol-transitionpoint) (type-only)
- `three` - `Camera`, `Matrix4`, `Vector4`
<!-- LIVE-DOC:END Dependencies -->
