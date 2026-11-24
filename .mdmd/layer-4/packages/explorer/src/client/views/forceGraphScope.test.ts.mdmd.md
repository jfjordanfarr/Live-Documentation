# `packages/explorer/src/client/views/forceGraphScope.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/explorer/src/client/views/forceGraphScope.test.ts`
- Generated At: 2026-11-24T18:30:17.294Z

## Authored
### Purpose
Holds the scope and the start to their rules over small hand-made graphs: the hops, the nearer hop for a sphere reached twice, the counts beyond, the links that connect in each layout, the groups by their seeds, the archipelago start and a tree's handle.

### Notes
Written with the module on 2026-10-31. The structure cases are the start the owner proposed, the root with its children in full and their children one hop further ([Turn 6 of the October 31 record](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-31/2026-10-31.1.record.md#turn-6)); the start cases include a document cited by more files than any file connects to, which must not be the start. Since 2026-11-02 ([Turn 3 of the November 2 record](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-02/2026-11-02.1.record.md#turn-3)) the Connections start is the archipelago, every group's seed and nothing grown; the seeds of the groups the hops do not reach stand one past the last hop; and a containment tree whose members the hops reach nothing of stands by its top hub, named by its files, where a group stands by its seed.

Since 2026-11-18 a case holds `withoutUnreachedSeeds`: the unreached seeds go, a seed asked about stays, and `hidden`, the neighbours and the counts of what remains are untouched ([Turn 10 of the November 18 record](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-10)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`local-storage.getDefaultTuning`](../persistence/local-storage.ts.mdmd.md#symbol-getdefaulttuning)
- [`forceGraphLayout.SpatialLink`](./forceGraphLayout.ts.mdmd.md#symbol-spatiallink) (type-only)
- [`forceGraphLayout.linkPulls`](./forceGraphLayout.ts.mdmd.md#symbol-linkpulls)
- [`forceGraphScope.StartableNode`](./forceGraphScope.ts.mdmd.md#symbol-startablenode) (type-only)
- [`forceGraphScope.componentLandmarks`](./forceGraphScope.ts.mdmd.md#symbol-componentlandmarks)
- [`forceGraphScope.componentMembers`](./forceGraphScope.ts.mdmd.md#symbol-componentmembers)
- [`forceGraphScope.connectedNeighbours`](./forceGraphScope.ts.mdmd.md#symbol-connectedneighbours)
- [`forceGraphScope.defaultSpatialLayout`](./forceGraphScope.ts.mdmd.md#symbol-defaultspatiallayout)
- [`forceGraphScope.directoryHubOf`](./forceGraphScope.ts.mdmd.md#symbol-directoryhubof)
- [`forceGraphScope.directoryMembersWithinHops`](./forceGraphScope.ts.mdmd.md#symbol-directorymemberswithinhops)
- [`forceGraphScope.spatialScope`](./forceGraphScope.ts.mdmd.md#symbol-spatialscope-function)
- [`forceGraphScope.startHops`](./forceGraphScope.ts.mdmd.md#symbol-starthops)
- [`forceGraphScope.startOf`](./forceGraphScope.ts.mdmd.md#symbol-startof)
- [`forceGraphScope.structureSeeds`](./forceGraphScope.ts.mdmd.md#symbol-structureseeds)
- [`forceGraphScope.withoutUnreachedSeeds`](./forceGraphScope.ts.mdmd.md#symbol-withoutunreachedseeds)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
