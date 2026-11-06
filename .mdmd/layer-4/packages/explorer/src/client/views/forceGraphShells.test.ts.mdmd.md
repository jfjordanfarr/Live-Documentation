# packages/explorer/src/client/views/forceGraphShells.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/views/forceGraphShells.test.ts
- Generated At: 2026-11-06T02:11:47.694Z

## Authored
### Purpose
Checks the directory shells' pure rules: the partition by depth and its chain naming, a pop that releases a directory's own files and makes its subdirectories shells without losing a file, the bundled wires and their counts in both directions, the rings left over, and the phantom packing, deterministic, inside its packing and within its hull.

### Notes
Written on 2026-11-05 with the experiment ([the design](../../../../../../../.mdmd/layer-3/live-documentation-explorer.mdmd.md#competing-layout-preferences)). The fixtures are small trees whose expected shells can be read by eye; the packing cases cover a body smaller than the outer layer, one just over it and one of 300 files, so that the hull's first take over the outer members alone is exercised against every member.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`local-storage.getDefaultTuning`](../persistence/local-storage.ts.mdmd.md#symbol-getdefaulttuning)
- [`fileConnections.FileConnection`](./fileConnections.ts.mdmd.md#symbol-fileconnection) (type-only)
- [`forceGraphLayout.SpatialLink`](./forceGraphLayout.ts.mdmd.md#symbol-spatiallink)
- [`forceGraphLayout.linkPulls`](./forceGraphLayout.ts.mdmd.md#symbol-linkpulls)
- [`forceGraphLayout.shellRadius`](./forceGraphLayout.ts.mdmd.md#symbol-shellradius)
- [`forceGraphLayout.spatialNodeRadius`](./forceGraphLayout.ts.mdmd.md#symbol-spatialnoderadius)
- [`forceGraphScope.StartableNode`](./forceGraphScope.ts.mdmd.md#symbol-startablenode)
- [`forceGraphScope.connectedNeighbours`](./forceGraphScope.ts.mdmd.md#symbol-connectedneighbours)
- [`forceGraphScope.spatialScope`](./forceGraphScope.ts.mdmd.md#symbol-spatialscope-function)
- [`forceGraphShells.OUTER_LAYER`](./forceGraphShells.ts.mdmd.md#symbol-outer_layer)
- [`forceGraphShells.ShellPartition`](./forceGraphShells.ts.mdmd.md#symbol-shellpartition)
- [`forceGraphShells.bodyShape`](./forceGraphShells.ts.mdmd.md#symbol-bodyshape)
- [`forceGraphShells.directoryAt`](./forceGraphShells.ts.mdmd.md#symbol-directoryat)
- [`forceGraphShells.packingRadius`](./forceGraphShells.ts.mdmd.md#symbol-packingradius)
- [`forceGraphShells.partitionHidden`](./forceGraphShells.ts.mdmd.md#symbol-partitionhidden)
- [`forceGraphShells.phantomShape`](./forceGraphShells.ts.mdmd.md#symbol-phantomshape)
- [`forceGraphShells.poppedAfter`](./forceGraphShells.ts.mdmd.md#symbol-poppedafter)
- [`forceGraphShells.shellDirectory`](./forceGraphShells.ts.mdmd.md#symbol-shelldirectory)
- [`forceGraphShells.shellId`](./forceGraphShells.ts.mdmd.md#symbol-shellid)
- [`forceGraphShells.shellPicture`](./forceGraphShells.ts.mdmd.md#symbol-shellpicture-function)
- [`forceGraphWrappers.WrapperHull`](./forceGraphWrappers.ts.mdmd.md#symbol-wrapperhull-interface)
- [`forceGraphWrappers.wrapperHull`](./forceGraphWrappers.ts.mdmd.md#symbol-wrapperhull-function)
- [`forceGraphWrappers.wrapperPadding`](./forceGraphWrappers.ts.mdmd.md#symbol-wrapperpadding)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
