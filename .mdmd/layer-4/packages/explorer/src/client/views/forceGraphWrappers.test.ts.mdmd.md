# packages/explorer/src/client/views/forceGraphWrappers.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/views/forceGraphWrappers.test.ts
- Generated At: 2026-11-06T02:11:47.913Z

## Authored
### Purpose
Holds the wrapped groups' geometry to its promises: which groups are wrapped, a group's hidden shape, the hull's enclosure and form, the merged geometry, the pick and the burst's pace.

### Notes
Written with the module on 2026-11-05 ([the design](../../../../../../../.mdmd/layer-3/live-documentation-explorer.mdmd.md#competing-layout-preferences)). Membership is checked against a real `spatialScope` over a small archipelago, at the start and beside a pin, so the wrapped seeds are exactly the groups of two files or more the scope shows by their seed. Enclosure is checked plane by plane: every member's centre stands at least its radius and the padding inside every face. The hull is checked as a closed surface (every edge in two triangles, once each way) with outward unit normals and at most 2V − 4 triangles; determinism by building twice, and a shape by ignoring the positions its nodes were given. The pick is checked nearest first, through a skipped wrapper, from inside a wrapper and beside every wrapper. The first run caught an expected seed chosen by hand that the scope's tie by id resolved otherwise.

Since 2026-11-05 a group's hull is taken over the phantom packing `bodyShape` builds rather than a hidden layout, and a case checks that the hull built over the outer members first still holds every member, including one that reaches past the first take.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`local-storage.getDefaultTuning`](../persistence/local-storage.ts.mdmd.md#symbol-getdefaulttuning)
- [`forceGraphLayout.SpatialLink`](./forceGraphLayout.ts.mdmd.md#symbol-spatiallink)
- [`forceGraphLayout.linkPulls`](./forceGraphLayout.ts.mdmd.md#symbol-linkpulls)
- [`forceGraphLayout.spatialNodeRadius`](./forceGraphLayout.ts.mdmd.md#symbol-spatialnoderadius)
- [`forceGraphScope.StartableNode`](./forceGraphScope.ts.mdmd.md#symbol-startablenode)
- [`forceGraphScope.spatialScope`](./forceGraphScope.ts.mdmd.md#symbol-spatialscope-function)
- [`forceGraphScope.startHops`](./forceGraphScope.ts.mdmd.md#symbol-starthops)
- [`forceGraphScope.startOf`](./forceGraphScope.ts.mdmd.md#symbol-startof)
- [`forceGraphShells.bodyShape`](./forceGraphShells.ts.mdmd.md#symbol-bodyshape)
- [`forceGraphWrappers.GroupShape`](./forceGraphWrappers.ts.mdmd.md#symbol-groupshape)
- [`forceGraphWrappers.WrapperHull`](./forceGraphWrappers.ts.mdmd.md#symbol-wrapperhull-interface)
- [`forceGraphWrappers.burstProgress`](./forceGraphWrappers.ts.mdmd.md#symbol-burstprogress)
- [`forceGraphWrappers.mergeWrappers`](./forceGraphWrappers.ts.mdmd.md#symbol-mergewrappers)
- [`forceGraphWrappers.wrappedSeeds`](./forceGraphWrappers.ts.mdmd.md#symbol-wrappedseeds)
- [`forceGraphWrappers.wrapperAt`](./forceGraphWrappers.ts.mdmd.md#symbol-wrapperat)
- [`forceGraphWrappers.wrapperHull`](./forceGraphWrappers.ts.mdmd.md#symbol-wrapperhull-function)
- [`forceGraphWrappers.wrapperPadding`](./forceGraphWrappers.ts.mdmd.md#symbol-wrapperpadding)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
