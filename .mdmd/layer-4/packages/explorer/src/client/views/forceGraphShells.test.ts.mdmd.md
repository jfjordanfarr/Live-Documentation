# packages/explorer/src/client/views/forceGraphShells.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/views/forceGraphShells.test.ts
- Generated At: 2026-11-08T04:02:26.570Z

## Authored
### Purpose
Checks the directory shells' pure rules: the partition by depth and its chain naming, a pop that releases a directory's own files and makes its subdirectories shells without losing a file, the bundled wires and their counts in both directions, the rings left over, and the phantom packing, deterministic, inside its packing and within its hull; since 2026-11-06, a shell's true size and the packing of its units inside it, its own files apart, its subdirectories' balloons each its own shell's size, at most `SHOWN_UNITS` shown.

### Notes
Written on 2026-11-05 with the experiment ([the design](../../../../../../../.mdmd/layer-3/live-documentation-explorer.mdmd.md#competing-layout-preferences)). The fixtures are small trees whose expected shells can be read by eye; the packing cases cover a body smaller than the outer layer, one just over it and one of 300 files, so that the hull's first take over the outer members alone is exercised against every member.

Since the second round of 2026-11-06 the packing cases are properties: a ball's spheres apart by the gap within a hundredth of it, held by its extent and the same in any order; a body's every file once, every unit inside its bubble and siblings apart, a chain collapsed, a lone subdirectory file that file, a bubble the body its shell has after a pop, a veiled bubble past the limit, and a group packed about its seed ([the evidence](../../../../../../../AI-Agent-Workspace/Screenshots/2026-11-06/shell-leaves/README.md)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`local-storage.getDefaultTuning`](../persistence/local-storage.ts.mdmd.md#symbol-getdefaulttuning)
- [`fileConnections.FileConnection`](./fileConnections.ts.mdmd.md#symbol-fileconnection) (type-only)
- [`forceGraphData.directoryNodeId`](./forceGraphData.ts.mdmd.md#symbol-directorynodeid)
- [`forceGraphData.spatialGraphOf`](./forceGraphData.ts.mdmd.md#symbol-spatialgraphof)
- [`forceGraphLayout.SpatialLink`](./forceGraphLayout.ts.mdmd.md#symbol-spatiallink)
- [`forceGraphLayout.linkPulls`](./forceGraphLayout.ts.mdmd.md#symbol-linkpulls)
- [`forceGraphLayout.shellRadiusOf`](./forceGraphLayout.ts.mdmd.md#symbol-shellradiusof)
- [`forceGraphLayout.spatialNodeRadius`](./forceGraphLayout.ts.mdmd.md#symbol-spatialnoderadius)
- [`forceGraphScope.StartableNode`](./forceGraphScope.ts.mdmd.md#symbol-startablenode)
- [`forceGraphScope.connectedNeighbours`](./forceGraphScope.ts.mdmd.md#symbol-connectedneighbours)
- [`forceGraphScope.spatialScope`](./forceGraphScope.ts.mdmd.md#symbol-spatialscope-function)
- [`forceGraphShells.DRAWN_FILES`](./forceGraphShells.ts.mdmd.md#symbol-drawn_files)
- [`forceGraphShells.ShellPartition`](./forceGraphShells.ts.mdmd.md#symbol-shellpartition)
- [`forceGraphShells.bodyGaps`](./forceGraphShells.ts.mdmd.md#symbol-bodygaps-function)
- [`forceGraphShells.bodyShape`](./forceGraphShells.ts.mdmd.md#symbol-bodyshape)
- [`forceGraphShells.bodySteps`](./forceGraphShells.ts.mdmd.md#symbol-bodysteps)
- [`forceGraphShells.directoryAt`](./forceGraphShells.ts.mdmd.md#symbol-directoryat)
- [`forceGraphShells.innerShape`](./forceGraphShells.ts.mdmd.md#symbol-innershape)
- [`forceGraphShells.packBall`](./forceGraphShells.ts.mdmd.md#symbol-packball)
- [`forceGraphShells.partitionHidden`](./forceGraphShells.ts.mdmd.md#symbol-partitionhidden)
- [`forceGraphShells.pictureVeils`](./forceGraphShells.ts.mdmd.md#symbol-pictureveils)
- [`forceGraphShells.poppedAfter`](./forceGraphShells.ts.mdmd.md#symbol-poppedafter)
- [`forceGraphShells.releaseOf`](./forceGraphShells.ts.mdmd.md#symbol-releaseof)
- [`forceGraphShells.shellDirectory`](./forceGraphShells.ts.mdmd.md#symbol-shelldirectory)
- [`forceGraphShells.shellId`](./forceGraphShells.ts.mdmd.md#symbol-shellid)
- [`forceGraphShells.shellPicture`](./forceGraphShells.ts.mdmd.md#symbol-shellpicture-function)
- [`forceGraphShells.structureCells`](./forceGraphShells.ts.mdmd.md#symbol-structurecells)
- [`forceGraphShells.structureSpokes`](./forceGraphShells.ts.mdmd.md#symbol-structurespokes)
- [`forceGraphWrappers.WrapperHull`](./forceGraphWrappers.ts.mdmd.md#symbol-wrapperhull-interface)
- [`forceGraphWrappers.wrapperHull`](./forceGraphWrappers.ts.mdmd.md#symbol-wrapperhull-function)
- [`types.ExplorerGraphPayload`](../../shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`types.ExplorerNodePayload`](../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
