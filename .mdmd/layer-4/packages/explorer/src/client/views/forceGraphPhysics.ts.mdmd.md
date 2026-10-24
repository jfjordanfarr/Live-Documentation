# packages/explorer/src/client/views/forceGraphPhysics.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/forceGraphPhysics.ts
- Generated At: 2026-10-24T20:00:09.070Z

## Authored
### Purpose
The motion of the 3D Local Map, the same in the browser and headlessly: the picture's forces written as one energy, a field whose forces are that energy's slope, and a damped motion through it that eases at a constant strength and comes to rest.

### Notes
`SpatialField` holds a spring on each pulling link toward its rest length, the repulsion of every sphere on every other (charge over distance, linear inside one unit, offset to meet zero at a bounded reach), a gravity toward the origin, an overlap penalty for spheres closer than their clearance, and a tether pulling each sphere toward an anchor. Every spring pulls its two ends equally and oppositely along the line between them as they stand. D3's spring, which this replaced, shares a pull unequally by its ends' link counts and aims it at where the spheres are about to be, and a picture under it at a constant strength never stopped moving ([the easing probe of 2026-10-19](../../../../../../../AI-Agent-Workspace/Probes/2026-10-19/easing/README.md)). The repulsion is summed over every pair exactly, in a stable order. Each first end’s running force stays local until its row is complete, avoiding repeated array writes without changing arithmetic order. Potential energy is evaluated and cached when read, against a snapshot of that reading’s positions and anchor. The browser uses motion and overlap readings without paying for a logarithm on every pair; the diagnostic energy remains available from the same field calculation. The earlier 13–23 ms measurements at 846–1,130 spheres predate this October 23 optimization.

`SpatialMotion` is damped velocity Verlet with fixed elapsed time and drag per outer tick (the layout module's 0.5 and 0.2, the probe's smooth control, which the owner found "quite natural"). There is no cooling schedule. The strength scales the forces, so that a lower strength eases the same field more gently to much the same rest; a field with several balanced arrangements may reach another of them by the gentler path. A sphere a hand holds stays where it is put and carries no velocity. The motion keeps the anchor the tether pulls toward, where the spheres stood when it began; `anchorHere` begins it again from where they stand, and `release` lets them unfold by the other forces alone, as a first picture does until it calms.

The outer tick is subdivided when the field is stiff. A many-leaf Structure hub could exceed fixed-step Verlet's stability limit even at ordinary spring settings, producing NaN coordinates that formerly counted as still ([the October 22 finding](../../../../../../../AI-Agent-Workspace/Probes/2026-10-22/3d-tuning/README.md), repaired during the [October 24 tuning pass](../../../../../../../AI-Agent-Workspace/Probes/2026-10-24/connections-tuning/layout-findings.md#integration-review-and-repair)). The field now accumulates a local upper bound on positive curvature during its existing pair pass: incident spring strengths, twice each active pair's positive radial repulsion/collision stiffness, gravity and an active tether. Substeps keep `step² × strength × stiffness` at most two, below the linear Verlet limit of four; an endpoint whose new contacts exceed that bound is retried with a smaller step. Partial steps leave five percent of the permitted time for smoothly increasing curvature, avoiding repeated retries at nearly identical endpoints. Each accepted step uses its own elapsed time for drag, and the tick still advances 0.5 in total. The stillness reading counts total travel through all accepted substeps, so an oscillation cannot look still merely by returning near its start. This is a local stiffness control, not an unconditional global guarantee across the repulsion's hard range cutoff. Coordinates, anchors, velocities, forces, stiffness and measured travel must remain finite; a failure throws before it can count as still.

The tether is what lets a large picture come to rest. Without it, measured on this repository on 2026-10-21, the tail of the motion is long journeys in directions nothing holds: in the connections layout half the spheres belong to no main piece, and lone files and islands travel a third of the picture round the shell where gravity and the main mass's push balance; in the structure layout whole branches swing about their joints, since a spring holds a distance and never an angle. Friction, a bounded reach and dashpots on the springs did not end them; a tether of 0.01 brought both layouts to rest in a few hundred ticks ([the work notes](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-21.1.record.md#work-notes-what-moves-in-the-tail-this-repository-headless), the owner's choice in [Turn 5](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-21.1.record.md#turn-5)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `FieldSpring` {#symbol-fieldspring}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphPhysics.ts#L25)

##### `FieldSpring` — Summary
One pulling link: the two spheres' indices, the rest length and the strength, as `forceGraphLayout.ts` rules them.

#### `FieldSettings` {#symbol-fieldsettings}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphPhysics.ts#L33)

##### `FieldSettings` — Summary
The field's constants, read from the tuning.

#### `FieldReading` {#symbol-fieldreading}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphPhysics.ts#L49)

##### `FieldReading` — Summary
What one evaluation of the field found beside the forces.

#### `PairDirection` {#symbol-pairdirection}
- Type: type
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphPhysics.ts#L60)

##### `PairDirection` — Summary
A direction for two spheres that stand exactly together, the same on every machine (set by `forceGraphLayout.ts`).

#### `SpatialField` {#symbol-spatialfield}
- Type: class
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphPhysics.ts#L68)

##### `SpatialField` — Summary
The conservative field over spheres at fixed indices. Positions and forces are flat arrays, x, y, z per sphere. The
repulsion is summed over every pair exactly, which costs the square of the spheres: about 21 ms a tick at 1,120
spheres on the dev box in the probe, near what D3's approximation cost there, and exact, so that the forces are an
energy's slope and the picture can come to rest.

#### `MotionSettings` {#symbol-motionsettings}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphPhysics.ts#L197)

##### `MotionSettings` — Summary
The motion's constants: the step of time per tick and the drag per unit of time.

#### `MotionTick` {#symbol-motiontick}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphPhysics.ts#L204)
- Extends: [`FieldReading`](#symbol-fieldreading)

##### `MotionTick` — Summary
How far one tick moved the spheres, beside the field's reading at the new positions.

#### `SpatialMotion` {#symbol-spatialmotion}
- Type: class
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphPhysics.ts#L220)

##### `SpatialMotion` — Summary
Damped velocity Verlet through a field at a constant strength: half a kick, a drift, the forces at the new place, half a
kick, with the drag applied as an exact decay in two halves around them. Each outer tick advances the same elapsed
time, split by the field's local positive-curvature bound; a substep whose endpoint is too stiff is retried smaller.
This is a local bound, not a global guarantee across the repulsion's hard range cutoff. A fixed sphere stays where it
is put and carries no velocity; the others feel it as usual. The strength scales the forces, so that a lower strength
eases the same field more gently; the picture still comes to rest where the forces balance, though a field with several
balanced arrangements may reach another of them by the gentler path. The tether holds each sphere to `anchor`, where it
stood when the motion began unless one is given, while `holding`; a picture unfolding from nothing is let go until it
has calmed, since where it was seeded is no place to hold it.

#### `diagonalOf` {#symbol-diagonalof}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphPhysics.ts#L333)

##### `diagonalOf` — Summary
The diagonal of the box around the spheres, the measure of the picture's size that stillness is judged against.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../../../../layer-3/architectural-decisions.mdmd.md)
- [`.mdmd/layer-3/change-over-time.mdmd.md`](../../../../../../layer-3/change-over-time.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
