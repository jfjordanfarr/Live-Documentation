# packages/explorer/src/client/views/forceGraphLayout.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/views/forceGraphLayout.test.ts
- Generated At: 2026-10-21T21:29:28.043Z

## Authored
### Purpose
Exercises the spatial grammar through the real motion headlessly, as the page eases it, as well as explicit radius and distance cases.

### Notes
Tests distinguish sphere volume from radius, maintain size semantics across presets, compare eased weak and strong coupling and Compact and Relaxed spacing, and start unequal spheres at coincident positions to exercise clearance rather than merely inspecting the configured formula. A reference drawn on demand in the structure layout moves nothing and still ends on its two spheres, since three-forcegraph draws no line whose ends are ids (2026-10-16).

Created for [the October 13 shared-preset implementation](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-6--shared-presets-and-advanced-tuning-approved-for-implementation).

The compact-equilibrium test (2026-10-17, restated 2026-10-18 and 2026-10-21) holds gravity: two clusters that never reference each other, toggled out and back twenty times, keep the picture's extent near where it began. Since October 24 it tests today's defaults separately from the fixed October 21 counterexample: the old settings remain compact with gravity, while their paired gravity-off run still has to exceed twice the initial extent and keep growing. Its measured 1.75 at the tenth cycle and 2.26 at the twentieth belong to that dated configuration, not to every later tether or spring default; since 2026-10-28 the configuration names the exact repulsion it was measured with, approximation zero, so that a later default for the approximation leaves it as it was. Non-finite coordinates and velocities supplied to headless easing must be refused before D3 can replace them with its seed or they can be called still.

Since 2026-10-21 the tests run the motion (`easeSpatialLayout`, `motionForce`) and hold its rules: a picture comes to rest the same way every time and, eased again from there, moves less than a hundredth of its size; a first picture unfolds from the library's seed and is held once it calms, its size the forces' own within five percent, where held from the seed it would stay smaller and take longer; zero strength ticks nothing and the bound is kept; a rebuilt field carries each sphere's velocity and anchor, so that the motion goes on exactly as if nothing were rebuilt; a hand's sphere stays put, the picture never counts as still while it is held, its spring partner keeps the spring's length to the hand and goes no further, since the tether holds it, and the motion falls still once and wakes again. A change eased at a tenth of the strength takes longer than at full and its first move is exactly a tenth; the tether keeps the spheres a change leaves alone nearer where they stood (17.8 units against 32.1 without it). Before that day these tests held D3's schedule: the ticks a reheat took, the share of alpha each force saw, the headless feed; that schedule went with the motion ([Turn 5](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-21.1.record.md#turn-5)). The placement of new spheres, the seeded direction and the springs' rule are held as before.

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
- [`types.ForceGraphTuning`](../types.ts.mdmd.md#symbol-forcegraphtuning) (type-only)
- [`forceGraphLayout.PlaceableNode`](./forceGraphLayout.ts.mdmd.md#symbol-placeablenode)
- [`forceGraphLayout.QUIET_TICKS`](./forceGraphLayout.ts.mdmd.md#symbol-quiet_ticks)
- [`forceGraphLayout.SpatialLink`](./forceGraphLayout.ts.mdmd.md#symbol-spatiallink)
- [`forceGraphLayout.SpatialNode`](./forceGraphLayout.ts.mdmd.md#symbol-spatialnode)
- [`forceGraphLayout.easeSpatialLayout`](./forceGraphLayout.ts.mdmd.md#symbol-easespatiallayout)
- [`forceGraphLayout.linkPulls`](./forceGraphLayout.ts.mdmd.md#symbol-linkpulls)
- [`forceGraphLayout.motionForce`](./forceGraphLayout.ts.mdmd.md#symbol-motionforce-function)
- [`forceGraphLayout.placeNewSpheres`](./forceGraphLayout.ts.mdmd.md#symbol-placenewspheres)
- [`forceGraphLayout.seededDirection`](./forceGraphLayout.ts.mdmd.md#symbol-seededdirection)
- [`forceGraphLayout.spatialFieldOf`](./forceGraphLayout.ts.mdmd.md#symbol-spatialfieldof)
- [`forceGraphLayout.spatialLinkDistance`](./forceGraphLayout.ts.mdmd.md#symbol-spatiallinkdistance)
- [`forceGraphLayout.spatialNodeRadius`](./forceGraphLayout.ts.mdmd.md#symbol-spatialnoderadius)
- [`forceGraphLayout.spatialNodeValue`](./forceGraphLayout.ts.mdmd.md#symbol-spatialnodevalue)
- [`forceGraphLayout.springStrength`](./forceGraphLayout.ts.mdmd.md#symbol-springstrength)
- [`forceGraphLayout.symbolCountOf`](./forceGraphLayout.ts.mdmd.md#symbol-symbolcountof)
- [`forceGraphPhysics.diagonalOf`](./forceGraphPhysics.ts.mdmd.md#symbol-diagonalof)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
