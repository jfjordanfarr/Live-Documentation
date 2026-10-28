# packages/explorer/src/client/views/forceGraphPhysics.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/views/forceGraphPhysics.test.ts
- Generated At: 2026-10-28T21:56:32.468Z

## Authored
### Purpose
Holds the field and the motion of `forceGraphPhysics.ts` to what makes a picture come to rest: forces that are the energy's slope, pulls that are equal and opposite, energy that falls every tick, and a tether that holds.

### Notes
The field's forces are checked against the energy's slope by finite differences at every coordinate of a small scene of five spheres with a chain, a branch and one overlap, under the shipped constants, a bounded reach, the repulsion and gravity away, and a tether toward an anchor set apart from the spheres; without gravity and the tether the forces sum to no net force and no turn. Two spheres standing exactly together are parted along the given direction with finite forces, and constants the field cannot honour are refused. The motion loses energy every tick and comes to rest where the forces balance, at a lower strength too, its first move in proportion to the strength; a held sphere stays where the hand puts it with no velocity while a sphere sprung to it follows. Two spheres that only repel part for ever, and the tether brings them to rest where its pull meets their push; the tether holds to where the motion began until it is let go and to where the spheres stand when anchored again.

The October 23 deferred-energy regression keeps an early tick, advances and re-anchors the motion, then reads that tick’s energy for the first time; the result must still describe the original positions and anchor.

The October 24 stiffness regressions cover the [many-leaf hub failure](../../../../../../../AI-Agent-Workspace/Probes/2026-10-24/connections-tuning/layout-findings.md#integration-review-and-repair): a 192-leaf star at spring strength .25 must settle at its original rest lengths, while a common translation loses exactly the drag associated with one outer tick. A collision entered during a step exercises endpoint retries and fixed-node handling. Local stiffness includes springs, capped and uncapped repulsion, collision and the held tether; a weak field must retain the original one-step Verlet arithmetic exactly. Travel through a stiff oscillation must remain visible to the stillness test. Non-finite input and force arithmetic must fail explicitly rather than manufacture a still picture.

The approximation's tests (2026-10-28) hold the octree walk to the exact loop: at approximation zero the field is the pair sum by hand; opening every cell gives the exact loop's forces, overlaps, stiffness and energy over 2,000 spheres with a crowd at one point, unbounded and with a reach; the overlaps are the exact loop's at any setting, and without repulsion so is every force, to the last digit, beside one sphere far larger than the rest. The error is bounded by what was measured on a seeded cloud of 2,000 spheres, a tenth more allowed (0.0024 at a quarter, 0.0122 at a half, 0.0517 at one, and the stiffness 0.10% under the exact one's at a half), and falls with the setting; the net force is a small share of the forces where exactly it is none; a bounded reach cuts as the exact loop cuts; a sphere is never pushed by itself, which a clump of sixteen and one far sphere would show at 1.5 as a push 12.9 percent too hard; one sphere, two, fifty at one point, a line of 500 and a crowd at one point inside a cloud come out finite and as the exact loop has them where nothing is approximated. Evaluations in steps give the numbers of one call however the spheres are divided, through the tree and exactly, a past reading's energy read in the middle of an evaluation disturbs nothing, and steps out of order, a finish too soon and an evaluation displaced by a later one are refused. Through the approximated field at a half, two clouds and two chains of 200 spheres, unfolded from D3's seed and held once calm as the page does, come to rest within a quarter more ticks than the exact field's, losing energy overall.

Each was seen to fail when the code was broken on purpose (2026-10-28), fifteen ways, each caught: a sphere's own cell taken whole, pairs summed unsorted, a cell pushing from its box's middle, a cell one sphere short, a cell straddling the reach taken whole, spheres at one point parted the wrong way, no stiffness from cells taken whole, the repulsion added as walked, steps accepted out of order, a later energy read sharing the field's scratch, the approximation's own check dropped, and, in the octree, a grid about the spheres' own bounds, a search forgetting a cell's largest radius, leaves twice too large and spheres at one point centred by a divided sum. The first and the grid's went uncaught at first, and the tests that catch them were written for them.

The original tests were seen to fail when the code was broken on purpose (2026-10-21): unequal spring reactions failed five, no drag three, held spheres ignored one, a reversed tether two, and a tick that dropped the anchor one. Written with the module, for the easing the owner asked to carry on "until it's stable enough to integrate" ([Turn 2](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-21.1.record.md#turn-2)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `d3-force-3d` - `forceSimulation`
- [`forceGraphLayout.MOTION`](./forceGraphLayout.ts.mdmd.md#symbol-motion)
- [`forceGraphLayout.QUIET_TICKS`](./forceGraphLayout.ts.mdmd.md#symbol-quiet_ticks)
- [`forceGraphLayout.STILL_FRACTION`](./forceGraphLayout.ts.mdmd.md#symbol-still_fraction)
- [`forceGraphLayout.UNFOLDED_FRACTION`](./forceGraphLayout.ts.mdmd.md#symbol-unfolded_fraction)
- [`forceGraphPhysics.FieldReading`](./forceGraphPhysics.ts.mdmd.md#symbol-fieldreading)
- [`forceGraphPhysics.FieldSettings`](./forceGraphPhysics.ts.mdmd.md#symbol-fieldsettings)
- [`forceGraphPhysics.FieldSpring`](./forceGraphPhysics.ts.mdmd.md#symbol-fieldspring)
- [`forceGraphPhysics.MotionTick`](./forceGraphPhysics.ts.mdmd.md#symbol-motiontick)
- [`forceGraphPhysics.SpatialField`](./forceGraphPhysics.ts.mdmd.md#symbol-spatialfield)
- [`forceGraphPhysics.SpatialMotion`](./forceGraphPhysics.ts.mdmd.md#symbol-spatialmotion)
- [`forceGraphPhysics.diagonalOf`](./forceGraphPhysics.ts.mdmd.md#symbol-diagonalof)
- `vitest` - `describe`, `expect`, `it`, `vi`
<!-- LIVE-DOC:END Dependencies -->
