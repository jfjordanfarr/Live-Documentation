# packages/explorer/src/client/views/forceGraphPhysics.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/views/forceGraphPhysics.test.ts
- Generated At: 2026-10-24T20:00:09.005Z

## Authored
### Purpose
Holds the field and the motion of `forceGraphPhysics.ts` to what makes a picture come to rest: forces that are the energy's slope, pulls that are equal and opposite, energy that falls every tick, and a tether that holds.

### Notes
The field's forces are checked against the energy's slope by finite differences at every coordinate of a small scene of five spheres with a chain, a branch and one overlap, under the shipped constants, a bounded reach, the repulsion and gravity away, and a tether toward an anchor set apart from the spheres; without gravity and the tether the forces sum to no net force and no turn. Two spheres standing exactly together are parted along the given direction with finite forces, and constants the field cannot honour are refused. The motion loses energy every tick and comes to rest where the forces balance, at a lower strength too, its first move in proportion to the strength; a held sphere stays where the hand puts it with no velocity while a sphere sprung to it follows. Two spheres that only repel part for ever, and the tether brings them to rest where its pull meets their push; the tether holds to where the motion began until it is let go and to where the spheres stand when anchored again.

The October 23 deferred-energy regression keeps an early tick, advances and re-anchors the motion, then reads that tick’s energy for the first time; the result must still describe the original positions and anchor.

The October 24 stiffness regressions cover the [many-leaf hub failure](../../../../../../../AI-Agent-Workspace/Probes/2026-10-24/connections-tuning/layout-findings.md#integration-review-and-repair): a 192-leaf star at spring strength .25 must settle at its original rest lengths, while a common translation loses exactly the drag associated with one outer tick. A collision entered during a step exercises endpoint retries and fixed-node handling. Local stiffness includes springs, capped and uncapped repulsion, collision and the held tether; a weak field must retain the original one-step Verlet arithmetic exactly. Travel through a stiff oscillation must remain visible to the stillness test. Non-finite input and force arithmetic must fail explicitly rather than manufacture a still picture.

The original tests were seen to fail when the code was broken on purpose (2026-10-21): unequal spring reactions failed five, no drag three, held spheres ignored one, a reversed tether two, and a tick that dropped the anchor one. Written with the module, for the easing the owner asked to carry on "until it's stable enough to integrate" ([Turn 2](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-21.1.record.md#turn-2)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`forceGraphPhysics.FieldSettings`](./forceGraphPhysics.ts.mdmd.md#symbol-fieldsettings)
- [`forceGraphPhysics.FieldSpring`](./forceGraphPhysics.ts.mdmd.md#symbol-fieldspring)
- [`forceGraphPhysics.SpatialField`](./forceGraphPhysics.ts.mdmd.md#symbol-spatialfield)
- [`forceGraphPhysics.SpatialMotion`](./forceGraphPhysics.ts.mdmd.md#symbol-spatialmotion)
- [`forceGraphPhysics.diagonalOf`](./forceGraphPhysics.ts.mdmd.md#symbol-diagonalof)
- `vitest` - `describe`, `expect`, `it`, `vi`
<!-- LIVE-DOC:END Dependencies -->
