# packages/explorer/src/client/views/forceGraphPhysics.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/forceGraphPhysics.ts
- Generated At: 2026-10-28T18:35:56.859Z

## Authored
### Purpose
The motion of the 3D Local Map, the same in the browser and headlessly: the picture's forces written as one energy; a field whose forces are that energy's slope when its repulsion is summed over every pair, and which sums the repulsion through an octree when the tuning's approximation asks it to; an evaluation of the field that can be taken in steps spread across animation frames; and a damped motion through the field that eases at a constant strength and comes to rest.

### Notes
`SpatialField` holds a spring on each pulling link toward its rest length, the repulsion of every sphere on every other (charge over distance, linear inside one unit, offset to meet zero at a bounded reach), a gravity toward the origin, an overlap penalty for spheres closer than their clearance, and a tether pulling each sphere toward an anchor. Every spring pulls its two ends equally and oppositely along the line between them as they stand. D3's spring, which this replaced, shares a pull unequally by its ends' link counts and aims it at where the spheres are about to be, and a picture under it at a constant strength never stopped moving ([the easing probe of 2026-10-19](../../../../../../../AI-Agent-Workspace/Probes/2026-10-19/easing/README.md)). At approximation zero the repulsion is summed over every pair exactly, in a stable order. Each first end’s running force stays local until its row is complete, avoiding repeated array writes without changing arithmetic order. Potential energy is evaluated and cached when read, against a snapshot of that reading’s positions and anchor. The browser uses motion and overlap readings without paying for a logarithm on every pair; the diagnostic energy remains available from the same field calculation. The earlier 13–23 ms measurements at 846–1,130 spheres predate this October 23 optimization.

The approximation (2026-10-28). The T3 bundle's 3D view froze the day before: one exact evaluation of its 21,720 spheres took 2.2 seconds and the first tick fifteen of them (the diagnosis in `AI-Agent-Workspace/Probes/2026-10-27/t3-code/3d-startup.md`). The owner decided that an approximation may be the field's default with the exact sum kept as the oracle, and named the lever `approximation` for what it adds, so that zero means none of it. Above zero the field builds an octree over the spheres at every evaluation ([`forceGraphOctree.ts`](forceGraphOctree.ts.mdmd.md)) and walks it once per sphere by Barnes and Hut's rule: a cell wholly beyond the reach is skipped; a cell that does not hold the sphere, lies wholly within the reach and whose box's largest side is less than the approximation times its distance pushes as all its spheres would from their centre of charge; any other cell is opened, a leaf to its spheres one by one. So a sphere never pushes itself, two at one point part as the exact loop parts them, and the reach cuts sphere by sphere where a cell straddles it. The overlaps are found through the same tree exactly, each sphere's search reaching as far as its radius, a cell's largest radius and the gap, and are summed in the exact loop's order of pairs, so that the overlaps and, without repulsion, every force are the exact loop's to the last digit. The stiffness reading keeps its meaning, a cell taken whole counting as its spheres at its centre, and the energy is approximated the same way, each pair counted from both of its ends and halved. Approximated, the field is no longer exactly an energy's slope: through it the energy can rise in a tick, by a few hundred-thousandths of itself in the motion's tests, while it falls overall.

What each setting costs was measured the same day in [the lab's run report](../../../../../../../AI-Agent-Workspace/Probes/2026-10-28/approximation/README.md). The rule's sharp threshold makes the approximated forces jump wherever a cell's ratio crosses it, and at large settings the jumps keep the spheres moving: at 0.9 and 1.2 three of the four pictures of this repository and the estate never came to rest in 5,000 ticks, against 218 to 548 for the exact field; at 0.7 one of 36 small test scenes did not; at 0.5 and below every picture and scene measured came to rest in about the exact field's ticks. A smoothed rule, blending a cell from taken whole to opened across a band below the threshold, let 0.9 come to rest on all four pictures in a prototype outside the source, at about twice the cost of each setting, and still left 1.2 restless on two; whether to adopt it is an open question for the owner, not the rule here.

Evaluation in steps (2026-10-28). The page must never hold the browser long enough to be offered its end, at any size, the owner's word of the same day, so an evaluation is `begin` (the checks, the springs and the tree), `step(from, to)` over consecutive runs of spheres from zero to the count (the exact loop's rows, or the overlaps by index and the repulsion in the tree's order), and `finish` (the approximated repulsion added, gravity, the tether, the greatest stiffness and the finite checks); `forces` is the three in one call, and the motion still calls it. How the spheres are divided between steps changes no number: the approximated repulsion is kept apart until the evaluation finishes, and every sum runs in one fixed order. A field holds one evaluation at a time, since its scratch is shared: beginning another ends the one before, whose steps then refuse to go on, and a later read of a reading's energy is evaluated in scratch of its own. At approximation zero the steps are the loop as it was to the last digit, forces, stiffness, overlaps and energy alike, in one call or divided anyhow; in one call it measured between five and fifteen percent slower than the loop before the split, at 5,000 spheres in runs interleaved with the old code on a shared machine, and no one difference of the split could be found to account for it.

`SpatialMotion` is damped velocity Verlet with fixed elapsed time and drag per outer tick (the layout module's 0.5 and 0.2, the probe's smooth control, which the owner found "quite natural"). There is no cooling schedule. The strength scales the forces, so that a lower strength eases the same field more gently to much the same rest; a field with several balanced arrangements may reach another of them by the gentler path. A sphere a hand holds stays where it is put and carries no velocity. The motion keeps the anchor the tether pulls toward, where the spheres stood when it began; `anchorHere` begins it again from where they stand, and `release` lets them unfold by the other forces alone, as a first picture does until it calms.

The outer tick is subdivided when the field is stiff. A many-leaf Structure hub could exceed fixed-step Verlet's stability limit even at ordinary spring settings, producing NaN coordinates that formerly counted as still ([the October 22 finding](../../../../../../../AI-Agent-Workspace/Probes/2026-10-22/3d-tuning/README.md), repaired during the [October 24 tuning pass](../../../../../../../AI-Agent-Workspace/Probes/2026-10-24/connections-tuning/layout-findings.md#integration-review-and-repair)). The field now accumulates a local upper bound on positive curvature during its existing pair pass: incident spring strengths, twice each active pair's positive radial repulsion/collision stiffness, gravity and an active tether. Substeps keep `step² × strength × stiffness` at most two, below the linear Verlet limit of four; an endpoint whose new contacts exceed that bound is retried with a smaller step. Partial steps leave five percent of the permitted time for smoothly increasing curvature, avoiding repeated retries at nearly identical endpoints. Each accepted step uses its own elapsed time for drag, and the tick still advances 0.5 in total. The stillness reading counts total travel through all accepted substeps, so an oscillation cannot look still merely by returning near its start. This is a local stiffness control, not an unconditional global guarantee across the repulsion's hard range cutoff. Coordinates, anchors, velocities, forces, stiffness and measured travel must remain finite; a failure throws before it can count as still.

The tether is what lets a large picture come to rest. Without it, measured on this repository on 2026-10-21, the tail of the motion is long journeys in directions nothing holds: in the connections layout half the spheres belong to no main piece, and lone files and islands travel a third of the picture round the shell where gravity and the main mass's push balance; in the structure layout whole branches swing about their joints, since a spring holds a distance and never an angle. Friction, a bounded reach and dashpots on the springs did not end them; a tether of 0.01 brought both layouts to rest in a few hundred ticks ([the work notes](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-21.1.record.md#work-notes-what-moves-in-the-tail-this-repository-headless), the owner's choice in [Turn 5](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-21.1.record.md#turn-5)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `FieldSpring` {#symbol-fieldspring}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphPhysics.ts#L38)

##### `FieldSpring` — Summary
One pulling link: the two spheres' indices, the rest length and the strength, as `forceGraphLayout.ts` rules them.

#### `FieldSettings` {#symbol-fieldsettings}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphPhysics.ts#L46)

##### `FieldSettings` — Summary
The field's constants, read from the tuning.

#### `FieldReading` {#symbol-fieldreading}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphPhysics.ts#L68)

##### `FieldReading` — Summary
What one evaluation of the field found beside the forces.

#### `PairDirection` {#symbol-pairdirection}
- Type: type
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphPhysics.ts#L79)

##### `PairDirection` — Summary
A direction for two spheres that stand exactly together, the same on every machine (set by `forceGraphLayout.ts`).

#### `FieldEvaluation` {#symbol-fieldevaluation}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphPhysics.ts#L85)

##### `FieldEvaluation` — Summary
One evaluation of the field in steps, so that its work can be spread across animation frames and the page never holds
the browser long enough to be offered its end (the owner, 2026-10-28). `forces` is the three in one call.

#### `SpatialField` {#symbol-spatialfield}
- Type: class
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphPhysics.ts#L141)

##### `SpatialField` — Summary
The field over spheres at fixed indices. Positions and forces are flat arrays, x, y, z per sphere. At `approximation`
zero the repulsion is summed over every pair exactly, which costs the square of the spheres, and the field is
conservative: its forces are an energy's slope. Above zero the repulsion is summed through an octree built afresh at
every evaluation, at a cost nearer n log n, with an error that grows with the approximation; the overlaps are found
through the same tree exactly and summed in the exact loop's order. An evaluation is the springs and the tree, then the
spheres in steps, then gravity and the tether (`begin`); `forces` takes it in one call. A field is made for one set of
spheres.

#### `MotionSettings` {#symbol-motionsettings}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphPhysics.ts#L452)

##### `MotionSettings` — Summary
The motion's constants: the step of time per tick and the drag per unit of time.

#### `MotionTick` {#symbol-motiontick}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphPhysics.ts#L459)
- Extends: [`FieldReading`](#symbol-fieldreading)

##### `MotionTick` — Summary
How far one tick moved the spheres, beside the field's reading at the new positions.

#### `SpatialMotion` {#symbol-spatialmotion}
- Type: class
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphPhysics.ts#L475)

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
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphPhysics.ts#L588)

##### `diagonalOf` — Summary
The diagonal of the box around the spheres, the measure of the picture's size that stillness is judged against.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`forceGraphOctree.SphereOctree`](./forceGraphOctree.ts.mdmd.md#symbol-sphereoctree)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../../../../layer-3/architectural-decisions.mdmd.md)
- [`.mdmd/layer-3/change-over-time.mdmd.md`](../../../../../../layer-3/change-over-time.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
