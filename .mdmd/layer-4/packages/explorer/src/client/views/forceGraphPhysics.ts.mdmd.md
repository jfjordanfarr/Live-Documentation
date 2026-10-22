# packages/explorer/src/client/views/forceGraphPhysics.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/forceGraphPhysics.ts
- Generated At: 2026-10-22T16:47:55.276Z

## Authored
### Purpose
The motion of the 3D Local Map, the same in the browser and headlessly: the picture's forces written as one energy, a field whose forces are that energy's slope, and a damped motion through it that eases at a constant strength and comes to rest.

### Notes
`SpatialField` holds a spring on each pulling link toward its rest length, the repulsion of every sphere on every other (charge over distance, linear inside one unit, offset to meet zero at a bounded reach), a gravity toward the origin, an overlap penalty for spheres closer than their clearance, and a tether pulling each sphere toward an anchor. Every spring pulls its two ends equally and oppositely along the line between them as they stand. D3's spring, which this replaced, shares a pull unequally by its ends' link counts and aims it at where the spheres are about to be, and a picture under it at a constant strength never stopped moving ([the easing probe of 2026-10-19](../../../../../../../AI-Agent-Workspace/Probes/2026-10-19/easing/README.md)). The repulsion is summed over every pair exactly, the square of the spheres, about 13 to 23 ms a tick on this repository's 846 to 1,130 spheres on the dev box, which is what D3's approximation costs there too.

`SpatialMotion` is damped velocity Verlet with a fixed step and a fixed drag (the layout module's 0.5 and 0.2, the probe's smooth control, which the owner found "quite natural"): no cooling schedule, so the drag alone brings a picture that is not pushed again to rest. The strength scales the forces, so that a lower strength eases the same field more gently to much the same rest; a field with several balanced arrangements may reach another of them by the gentler path. A sphere a hand holds stays where it is put and carries no velocity. The motion keeps the anchor the tether pulls toward, where the spheres stood when it began; `anchorHere` begins it again from where they stand, and `release` lets them unfold by the other forces alone, as a first picture does until it calms.

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
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphPhysics.ts#L58)

##### `PairDirection` — Summary
A direction for two spheres that stand exactly together, the same on every machine (set by `forceGraphLayout.ts`).

#### `SpatialField` {#symbol-spatialfield}
- Type: class
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphPhysics.ts#L66)

##### `SpatialField` — Summary
The conservative field over spheres at fixed indices. Positions and forces are flat arrays, x, y, z per sphere. The
repulsion is summed over every pair exactly, which costs the square of the spheres: about 21 ms a tick at 1,120
spheres on the dev box in the probe, near what D3's approximation cost there, and exact, so that the forces are an
energy's slope and the picture can come to rest.

#### `MotionSettings` {#symbol-motionsettings}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphPhysics.ts#L156)

##### `MotionSettings` — Summary
The motion's constants: the step of time per tick and the drag per unit of time.

#### `MotionTick` {#symbol-motiontick}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphPhysics.ts#L162)
- Extends: [`FieldReading`](#symbol-fieldreading)

##### `MotionTick` — Summary
How far one tick moved the spheres, beside the field's reading at the new positions.

#### `SpatialMotion` {#symbol-spatialmotion}
- Type: class
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphPhysics.ts#L176)

##### `SpatialMotion` — Summary
Damped velocity Verlet through a field at a constant strength: half a kick, a drift, the forces at the new place, half a
kick, with the drag applied as an exact decay in two halves around them. A fixed sphere, one a hand holds, stays where it
is put and carries no velocity; the others feel it as usual. The strength scales the forces, so that a lower strength
eases the same field more gently; the picture still comes to rest where the forces balance, though a field with several
balanced arrangements may reach another of them by the gentler path. The tether holds each sphere to `anchor`, where it
stood when the motion began unless one is given, while `holding`; a picture unfolding from nothing is let go until it
has calmed, since where it was seeded is no place to hold it.

#### `diagonalOf` {#symbol-diagonalof}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphPhysics.ts#L256)

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
