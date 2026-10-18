# packages/explorer/src/client/views/forceGraphLayout.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/views/forceGraphLayout.test.ts
- Generated At: 2026-10-18T20:50:50.607Z

## Authored
### Purpose
Exercises the spatial grammar through real deterministic force simulations as well as explicit radius and distance cases.

### Notes
Tests distinguish sphere volume from radius, maintain size semantics across presets, compare actual settled weak/strong coupling and Compact/Relaxed spacing, and start unequal spheres at coincident positions to exercise clearance rather than merely inspecting the configured formula.

Created for [the October 13 shared-preset implementation](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-6--shared-presets-and-advanced-tuning-approved-for-implementation).

The compact-equilibrium test of 2026-10-17 holds gravity: two clusters that never reference each other, toggled out and back five times, keep the picture's extent within a tenth, where the forces as they were let it grow to 3.16 times.

The update energy's tests (2026-10-18, ticket C2 of [the change-over-time plan](../../../../../../../.mdmd/layer-3/change-over-time.mdmd.md#open-questions)) hold the lever to the simulation's own terms: the schedule of a change (all of alpha at one, a reheat to the fraction that stops at the same stillness, nothing at or below it, and a refusal outside zero to one); the ticks to settle counted as the library counts them (300 at one, 200 at a tenth, 100 at a hundredth, 149 at the probe's doubled cooling); a scaled force seeing exactly its share (a repulsion at half the share moves a pair half as far in one tick, and wrapping the wrapper scales once); the seeded direction's unit length and sameness; the placement of new spheres (a hub at its placed members' centroid, a born file at its hub's rest length in its seeded direction, a new directory and its file placed one after another, a file of the root hanging from the root, a born file in the connections layout beside the files it references, and nothing placed that nothing placed holds); and the headless feed, three hundred ticks at full energy, two hundred at a tenth with a smaller stir of the unchanged, none at placement with every position kept and the inputs untouched. The feed's test says why the toy cannot hold a ratio: with two of six spheres returning, the library's centring and the collision, which ignore alpha, carry much of the move, so the share's own effect is measured with those out of the way, and the real bundles' ratios are the lab's reports.

The springs' strength tests (2026-10-18) hold the lever to D3's rule: one tick of the springs alone draws a pair half as far at a half, twice as far at two and not at all at zero, and the rule inside the lever gives a wire between two files of two wires each half a lone pair's strength, a hub's wire to a leaf the leaf's one.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `d3-force-3d` - `forceLink`, `forceManyBody`, `forceSimulation`
- [`layout-presets.applyLayoutPreset`](../layout-presets.ts.mdmd.md#symbol-applylayoutpreset)
- [`local-storage.getDefaultTuning`](../persistence/local-storage.ts.mdmd.md#symbol-getdefaulttuning)
- [`forceGraphLayout.LIBRARY_ALPHA_DECAY`](./forceGraphLayout.ts.mdmd.md#symbol-library_alpha_decay)
- [`forceGraphLayout.PlaceableNode`](./forceGraphLayout.ts.mdmd.md#symbol-placeablenode)
- [`forceGraphLayout.SETTLED_ALPHA`](./forceGraphLayout.ts.mdmd.md#symbol-settled_alpha)
- [`forceGraphLayout.SpatialLink`](./forceGraphLayout.ts.mdmd.md#symbol-spatiallink)
- [`forceGraphLayout.SpatialNode`](./forceGraphLayout.ts.mdmd.md#symbol-spatialnode)
- [`forceGraphLayout.configureSpatialForces`](./forceGraphLayout.ts.mdmd.md#symbol-configurespatialforces)
- [`forceGraphLayout.linkPulls`](./forceGraphLayout.ts.mdmd.md#symbol-linkpulls)
- [`forceGraphLayout.placeNewSpheres`](./forceGraphLayout.ts.mdmd.md#symbol-placenewspheres)
- [`forceGraphLayout.pullingLinkForce`](./forceGraphLayout.ts.mdmd.md#symbol-pullinglinkforce)
- [`forceGraphLayout.scaledForce`](./forceGraphLayout.ts.mdmd.md#symbol-scaledforce)
- [`forceGraphLayout.seededDirection`](./forceGraphLayout.ts.mdmd.md#symbol-seededdirection)
- [`forceGraphLayout.settleSpatialUpdate`](./forceGraphLayout.ts.mdmd.md#symbol-settlespatialupdate)
- [`forceGraphLayout.settleTicksOf`](./forceGraphLayout.ts.mdmd.md#symbol-settleticksof)
- [`forceGraphLayout.simulateSpatialLayout`](./forceGraphLayout.ts.mdmd.md#symbol-simulatespatiallayout)
- [`forceGraphLayout.spatialLinkDistance`](./forceGraphLayout.ts.mdmd.md#symbol-spatiallinkdistance)
- [`forceGraphLayout.spatialNodeRadius`](./forceGraphLayout.ts.mdmd.md#symbol-spatialnoderadius)
- [`forceGraphLayout.spatialNodeValue`](./forceGraphLayout.ts.mdmd.md#symbol-spatialnodevalue)
- [`forceGraphLayout.springStrength`](./forceGraphLayout.ts.mdmd.md#symbol-springstrength)
- [`forceGraphLayout.updateSchedule`](./forceGraphLayout.ts.mdmd.md#symbol-updateschedule-function)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
