# packages/explorer/src/client/views/forceGraphLayout.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/views/forceGraphLayout.test.ts
- Generated At: 2026-10-16T21:14:09.487Z

## Authored
### Purpose
Exercises the spatial grammar through real deterministic force simulations as well as explicit radius and distance cases.

### Notes
Tests distinguish sphere volume from radius, maintain size semantics across presets, compare actual settled weak/strong coupling and Compact/Relaxed spacing, and start unequal spheres at coincident positions to exercise clearance rather than merely inspecting the configured formula.

Created for [the October 13 shared-preset implementation](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-6--shared-presets-and-advanced-tuning-approved-for-implementation).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `d3-force-3d` - `forceLink`, `forceSimulation`
- [`layout-presets.applyLayoutPreset`](../layout-presets.ts.mdmd.md#symbol-applylayoutpreset)
- [`local-storage.getDefaultTuning`](../persistence/local-storage.ts.mdmd.md#symbol-getdefaulttuning)
- [`forceGraphLayout.SpatialLink`](./forceGraphLayout.ts.mdmd.md#symbol-spatiallink)
- [`forceGraphLayout.SpatialNode`](./forceGraphLayout.ts.mdmd.md#symbol-spatialnode)
- [`forceGraphLayout.linkPulls`](./forceGraphLayout.ts.mdmd.md#symbol-linkpulls)
- [`forceGraphLayout.pullingLinkForce`](./forceGraphLayout.ts.mdmd.md#symbol-pullinglinkforce)
- [`forceGraphLayout.simulateSpatialLayout`](./forceGraphLayout.ts.mdmd.md#symbol-simulatespatiallayout)
- [`forceGraphLayout.spatialLinkDistance`](./forceGraphLayout.ts.mdmd.md#symbol-spatiallinkdistance)
- [`forceGraphLayout.spatialNodeRadius`](./forceGraphLayout.ts.mdmd.md#symbol-spatialnoderadius)
- [`forceGraphLayout.spatialNodeValue`](./forceGraphLayout.ts.mdmd.md#symbol-spatialnodevalue)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
