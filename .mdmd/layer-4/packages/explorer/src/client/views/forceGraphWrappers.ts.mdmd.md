# packages/explorer/src/client/views/forceGraphWrappers.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/forceGraphWrappers.ts
- Generated At: 2026-11-05T23:08:51.629Z

## Authored
### Purpose
Builds the wrapped groups of the 3D Local Map's Group Wrappers experiment: which groups are wrapped, each group's hidden layout and padded convex hull, every wrapper merged into one geometry centred on the seeds' live places, the pick of the wrapper a ray meets first, and the pace of a wrapper's burst when it is popped open.

### Notes
Built on 2026-11-05 at the owner's request to push forward the shrink-wrap of hidden groups, "a meshing optimization that would also be as fun as popping bubble wrap or balloons" ([Turn 10 of the November 5 record](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-10)), from their proposal of November 4 ([Turn 16 of the November 3 record](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-03.1.record.md#turn-16--november-4)) and the [throwaway probe](../../../../../../../AI-Agent-Workspace/Probes/2026-11-04/cluster-wrap/README.md) that drew one padded convex hull as a skin, a cage and a cloud. The owner favoured the cloud for reducing visible line density and the skin for "that itch to click it and pop it open", and wondered about a combination ([Turn 17](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-03.1.record.md#turn-17--november-4)); the cage's mesh lines were noise and are not offered. The view draws and picks what this module builds, behind the tuning's Group Wrappers choice, off by default ([the design](../../../../../../../.mdmd/layer-3/live-documentation-explorer.mdmd.md#competing-layout-preferences)).

Only a disconnected group the scope shows by its seed alone, of two files or more, is wrapped (`wrappedSeeds` over `SpatialScope.groups`, with its files from `groupFiles`). No wire leaves such a group, so a wrapper can hide no route: the owner's "Dangerous and true" on a cloud concealing a connecting route ([Turn 18](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-03.1.record.md#turn-18--november-4)). A ring's hidden neighbourhood inside a connected component is not a disjoint bag of files, and which wrapper would own a file two frontier spheres both reach is a design question the records leave open, so nothing here wraps one.

`groupShapeOf` eases the group alone with `easeSpatialLayout`, from no positions, in the connections layout, members in id order, so the same files, links and tuning give the same shape; the view caches it per group and tuning. `wrapperHull` stands each member's sphere, padded by `wrapperPadding`, in for a 42-vertex geodesic polyhedron whose inscribed sphere is the padded sphere, and takes Three's quickhull over all of them, so the hull holds every padded sphere whole; normals are area-weighted means, so the hull shades as one smooth surface. A convex hull bridges a group's hollows: an outer envelope, not a concave shrink-wrap. `mergeWrappers` copies each seed's place (a caller may hand one object back for every seed: the first build drew every hull at the last seed's place) and writes each vertex's group and its seed-relative position in units of its hull's radius, so the cloud's pattern spans a small wrapper as it spans a large one; at world scale it drew a fine weave over this repository's largest group. Measurements are in [the evidence](../../../../../../../AI-Agent-Workspace/Screenshots/2026-11-05/group-wrappers/README.md).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `GROUP_WRAPPERS` {#symbol-group_wrappers}
- Type: unknown
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphWrappers.ts#L24)

#### `GroupWrappers` {#symbol-groupwrappers}
- Type: type (type-only)
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphWrappers.ts#L24)

#### `wrappedSeeds` {#symbol-wrappedseeds}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphWrappers.ts#L29)
- Parameters: `groups`: `ReadonlyMap`

##### `wrappedSeeds` — Summary
The seeds of the groups wrapped: those the scope shows only by their seed, of two files or more, in id order.

#### `GroupMember` {#symbol-groupmember}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphWrappers.ts#L34)
- Extends: [`Placed`](./worldMap/layout.ts.mdmd.md#symbol-placed)

##### `GroupMember` — Summary
One member of a group's hidden layout: where it stands relative to the seed, and its sphere's radius.

#### `GroupShape` {#symbol-groupshape}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphWrappers.ts#L40)

##### `GroupShape` — Summary
A group's hidden layout, every member relative to its seed, the seed at the origin.

#### `groupShapeOf` {#symbol-groupshapeof}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphWrappers.ts#L50)
- Returns: [`GroupShape`](#symbol-groupshape)
- Parameters: `tuning`: [`ForceGraphTuning`](../types.ts.mdmd.md#symbol-forcegraphtuning)

##### `groupShapeOf` — Summary
Lay a group out alone, as the 3D picture would were the whole group shown: its members and their links eased headlessly
with the page's own motion and the tuning's forces in the connections layout, from no positions, so that the same group
and tuning give the same shape on every machine. Positions are relative to the seed's. Members are taken in id order.

#### `wrapperPadding` {#symbol-wrapperpadding}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphWrappers.ts#L65)

##### `wrapperPadding` — Summary
The space a wrapper keeps around each member's sphere: one and a half times the radius of a file with no symbols.

#### `WrapperHull (interface)` {#symbol-wrapperhull-interface}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphWrappers.ts#L70)

##### `WrapperHull (interface)` — Summary
A group's hull, relative to its seed: vertex positions and smooth normals, its triangles, and the radius from the seed that holds it.

#### `wrapperHull (function)` {#symbol-wrapperhull-function}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphWrappers.ts#L116)
- Returns: [`WrapperHull`](#symbol-wrapperhull-interface)
- Parameters: `shape`: [`GroupShape`](#symbol-groupshape)

##### `wrapperHull (function)` — Summary
The convex hull of a group's padded spheres, relative to its seed. Each vertex's normal is the area-weighted mean of
its triangles' outward normals, so that the hull shades as one smooth surface. Triangles wind outward.

#### `WrapperRange` {#symbol-wrapperrange}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphWrappers.ts#L158)

##### `WrapperRange` — Summary
Where one group stands in the merged geometry.

#### `WrapperGeometry` {#symbol-wrappergeometry}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphWrappers.ts#L171)

##### `WrapperGeometry` — Summary
Every wrapper in one geometry: world positions, normals, each vertex's group and its seed-relative position, and the triangles.

#### `mergeWrappers` {#symbol-mergewrappers}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphWrappers.ts#L189)
- Returns: [`WrapperHull`](#symbol-wrapperhull-interface), [`Placed`](./worldMap/layout.ts.mdmd.md#symbol-placed), [`WrapperGeometry`](#symbol-wrappergeometry)

##### `mergeWrappers` — Summary
Merge the hulls of the groups wrapped into one geometry, each centred on its seed's live position: the wrappers are the
seeds `wrappedSeeds` names, each drawn when its hull and its seed's position are known, in the seeds' order. `scale`
grows a group's hull about its seed, as a pop does (one when absent).

#### `wrapperAt` {#symbol-wrapperat}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphWrappers.ts#L227)
- Parameters: `geometry`: [`WrapperGeometry`](#symbol-wrappergeometry); `origin`: [`Placed`](./worldMap/layout.ts.mdmd.md#symbol-placed); `direction`: [`Placed`](./worldMap/layout.ts.mdmd.md#symbol-placed)

##### `wrapperAt` — Summary
The nearest wrapper a ray meets, and how far along the ray: each group's bounding sphere first, then its triangles,
either side, as the wrappers are drawn double-sided. `skip` leaves a group out, as one bursting open is.

#### `burstProgress` {#symbol-burstprogress}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphWrappers.ts#L266)

##### `burstProgress` — Summary
How far a wrapper has burst open `elapsed` milliseconds after its pop: from zero to one over `duration`, eased out, so
that it grows by a tenth and fades as the files fill it; at once under reduced motion.

#### `BURST` {#symbol-burst}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphWrappers.ts#L273)

##### `BURST` — Summary
How long a wrapper takes to burst open, and how much it grows as it does.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.ForceGraphTuning`](../types.ts.mdmd.md#symbol-forcegraphtuning) (type-only)
- [`types.GROUP_WRAPPERS`](../types.ts.mdmd.md#symbol-group_wrappers) (type-only)
- [`types.GroupWrappers`](../types.ts.mdmd.md#symbol-groupwrappers) (type-only)
- [`forceGraphLayout.Placed`](./forceGraphLayout.ts.mdmd.md#symbol-placed)
- [`forceGraphLayout.SpatialLink`](./forceGraphLayout.ts.mdmd.md#symbol-spatiallink)
- [`forceGraphLayout.easeSpatialLayout`](./forceGraphLayout.ts.mdmd.md#symbol-easespatiallayout)
- [`forceGraphLayout.linkPulls`](./forceGraphLayout.ts.mdmd.md#symbol-linkpulls)
- [`forceGraphLayout.spatialNodeRadius`](./forceGraphLayout.ts.mdmd.md#symbol-spatialnoderadius)
- [`forceGraphScope.StartableNode`](./forceGraphScope.ts.mdmd.md#symbol-startablenode) (type-only)
- `three` - `Vector3`
- `three/addons/math/ConvexHull.js` - `ConvexHull`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
