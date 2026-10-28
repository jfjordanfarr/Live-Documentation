# packages/explorer/src/client/views/forceGraphLayout.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/forceGraphLayout.ts
- Generated At: 2026-10-28T18:59:46.795Z

## Authored
### Purpose
Implements the 3D Local Map’s shared geometry and motion: symbol-sized spheres, hubs sized by their members, coupling-dependent gaps, the rule for which links pull in each layout, the field those settings make, and the force that eases the picture through it until the spheres are still, in the browser and headlessly alike.

### Notes
Sphere volume grows from one baseline unit plus the documented public-symbol count; a directory hub's volume is the sum of its members' volumes, so that size means exposed surface at every scale (2026-10-14). A logarithmic coupling term shortens surface gaps, bounded below by collision clearance. `springStrength` gives each wire D3's own rule, one over the smaller of its two ends' pulling-link counts, times the tuning's `linkStrength`, so that one is the picture as it was and the owner can raise the pull between connected neighbours against a weaker pull to the centre ([Turn 7 of the October 17 session](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-17.1.record.md#turn-7)). `symbolCountOf` reads the count a node carries when its symbols' names are not at hand, as at a step of the history, so that a sphere breathes with its symbols at every step (2026-10-18). A count that is not a number of symbols, as a broken or hostile history file can carry, is read as none: the no-network spec's history with markup for a count gave a sphere a radius the motion refuses, and its picture never came to rest (2026-10-21). Neither positions nor symbol counts imply runtime call frequency or code complexity.

Which links pull: references in the connections layout, containment in the structure layout (`linkPulls`); `spatialFieldOf` makes a spring of the pulling ones alone. The page's link force, and the headless twin's, still holds every link at strength zero, because D3 resolves the endpoints of only the links it holds and three-forcegraph draws no line whose ends are ids: until 2026-10-16 every reference revealed in the structure layout was visible but never drawn, a unit tube at the origin.

The motion (2026-10-21). `motionForce` is the one force that moves the spheres: D3's simulation, the library's and the headless one alike, drives the ticks, and each tick the force reads the spheres where they stand, holds those a hand has fixed, steps the damped motion of [`forceGraphPhysics.ts`](forceGraphPhysics.ts.mdmd.md) through the field at a constant strength, writes the positions back and zeroes D3's own velocities, so that nothing else moves a sphere. It ignores alpha: there is no cooling, and the easing ends when the largest move of a tick has stayed under `STILL_FRACTION` (3×10⁻⁵) of the picture's diagonal for `QUIET_TICKS` (ten) ticks with the tether holding and no sphere in a hand, the owner's "still by its motion and not by a clock" (2026-10-18). A sphere keeps its velocity and its anchor by id when the field is built again. A motion begins held where the spheres stand, for a change of what is shown or a hand, so that the picture keeps a person's bearings, or unfolds freely and is held once it calms below `UNFOLDED_FRACTION` (10⁻³ of the diagonal per tick), for a first picture, a layout or new forces: held from the library's seed, a ball a hundredth of the picture's size, a picture would stay far too small. On this repository a first picture is still some 350 to 390 ticks after the seed, and a change of tests shown or a hand's release some 170 to 560 ([the measurements](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-21.1.record.md#work-notes-what-moves-in-the-tail-this-repository-headless), and the tether's choice in [Turns 4 and 5](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-21.1.record.md#turn-5)). `easeSpatialLayout` is the headless twin of the page, for the layout lab and the tests.

Since the [October 24 stiffness repair](../../../../../../../AI-Agent-Workspace/Probes/2026-10-24/connections-tuning/layout-findings.md#integration-review-and-repair), the physics module may subdivide a tick while preserving its total elapsed time and drag. The stillness threshold applies to total distance travelled during the outer tick, including any reversal between its internal steps. The headless entry refuses supplied non-finite coordinates and velocities before D3 can reinterpret them as a request for a fresh seed; missing coordinates still request placement normally. Invalid motion and size readings throw instead of reporting stillness.

The update energy (`ForceGraphTuning.updateEnergy`, the change-over-time plan's ticket C2) is the constant strength a membership change eases at, a share of the forces; the first picture, a hand and a change of the forces ease at one. From 2026-10-18 to 2026-10-21 it was a reheat's alpha under D3's cooling, applied through wrappers that scaled each force's alpha (`updateSchedule`, `scaledForce`, `pullingLinkForce`, `configureSpatialForces`, `settleSpatialUpdate`), and a picture fed at a constant share never came to rest: D3 splits a spring's pull between its ends unequally and aims it at where the spheres are about to be ([the easing probe of 2026-10-19](../../../../../../../AI-Agent-Workspace/Probes/2026-10-19/easing/README.md)). Those went with the motion.

Gravity and the repulsion's reach (2026-10-17): nothing drew two unconnected clusters together before, so every reheat pushed them apart, which the owner saw as "the microgalaxies drift further apart" ([Turn 3 of the October 17 session](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-17.1.record.md#turn-3)). Gravity pulls every sphere toward the origin in proportion to its distance (`tuning.gravity`), and the repulsion's reach can be bounded (`tuning.chargeRange`, unbounded at zero); the owner confirmed the direction, "Boom. Exactly." ([Turn 5](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-17.1.record.md#turn-5)). The repulsion's approximation (`tuning.approximation`, 2026-10-28) reaches the field the same way, through `spatialFieldOf`; what it is and what it costs are the physics module's. The shipped 0.01 was chosen by eye on a picture D3's cooling had frozen at a little over half the size its forces balance at; eased to rest, the same tuning gives a picture 1.8 to 1.9 times as wide (measured 2026-10-21).

The carry is `placeNewSpheres`: a sphere that was in the picture keeps its place, a hub new to it starts at the centroid of its placed members, and any other new sphere starts beside what it is wired to by a pulling link at the spring's rest length, in a direction `seededDirection` draws from its id, so that nothing erupts from the origin; a sphere with nothing placed to start from is left to D3's seat.

Created for [the October 13 shared-preset implementation](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-6--shared-presets-and-advanced-tuning-approved-for-implementation).
A document's citation of a file (2026-10-22, [the decision](../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#related-documents-run-both-ways-a-docs-cited-by-section-is-generated-from-the-documents-own-links-recorded-2026-10-22)) pulls by `ForceGraphTuning.citedByPull`, a share of a documented reference's spring (`springShare`), one by default so that it pulls as a reference does and zero to draw the line and move nothing: `linkPulls` takes the tuning and leaves such a link out of the springs, the degrees and the carry at zero. The owner asked to see the pull before deciding on it: "I want to see it before I assert it should have no pull" ([Turn 2](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-22.1.record.md#turn-2)).

The headless easing reveals the picture as the page does (2026-10-28, [the reveal](forceGraphReveal.ts.mdmd.md)): `easeSpatialLayout` takes `reveal`, the attention set and the constants defaulting to `REVEAL`, feeds the first piece in the input order so that a picture no larger than it eases exactly as before, and after the page's hidden ticks adds a share at every tick, placing each newcomer by `placeNewSpheres` as it enters. `MotionForce.stir` counts stillness afresh without changing how the motion holds, for spheres entering mid-motion, and `MotionSource.onNodes` hands the page the array the simulation applied, so that the page knows when a piece is in. The page grows after the engine tick that follows the warm-up and the piece applies before the next tick, so the twin grows after that tick too ([the Turn 4 work notes](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-28.1.record.md#turn-4-work-notes)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SpatialNode` {#symbol-spatialnode}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L9)
- Extends: `SimulationNodeDatum`

##### `SpatialNode` — Summary
The documented interface and mutable position of a file, or of a directory hub, in the spatial layout.

#### `symbolCountOf` {#symbol-symbolcountof}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L23)

##### `symbolCountOf` — Summary
How many public symbols a file exposes: the count it carries, or its names counted. A count that is not a number of
symbols, as a broken or hostile history file can carry, is none, so that one bad value cannot give a sphere a size the
motion refuses and stop the picture (2026-10-21).

#### `SpatialLink` {#symbol-spatiallink}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L29)
- Constraints: [`SpatialNode`](#symbol-spatialnode)

##### `SpatialLink` — Summary
One undirected file pair; count is the number of documented references in either direction.

#### `spatialNodeValue` {#symbol-spatialnodevalue}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L42)
- Parameters: `node`: [`SpatialNode`](#symbol-spatialnode); `tuning`: [`ForceGraphTuning`](../types.ts.mdmd.md#symbol-forcegraphtuning)

##### `spatialNodeValue` — Summary
The value is sphere volume. A file's grows with its exposed symbols plus one baseline unit, so a zero-symbol file still
has a visible body; a directory hub's is the sum of its members' volumes, so that size means exposed surface at every
scale (the owner's "pedagogical" invariant, 2026-10-14).

#### `spatialNodeRadius` {#symbol-spatialnoderadius}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L49)
- Parameters: `node`: [`SpatialNode`](#symbol-spatialnode); `tuning`: [`ForceGraphTuning`](../types.ts.mdmd.md#symbol-forcegraphtuning)

##### `spatialNodeRadius` — Summary
Actual sphere radius, shared by rendering, collision clearance and the command's report.

#### `spatialLinkDistance` {#symbol-spatiallinkdistance}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L54)
- Parameters: `link`: [`SpatialLink`](#symbol-spatiallink); `tuning`: [`ForceGraphTuning`](../types.ts.mdmd.md#symbol-forcegraphtuning)

##### `spatialLinkDistance` — Summary
More coupling reduces the desired surface gap with diminishing returns, without changing the node-size meaning.

#### `linkPulls` {#symbol-linkpulls}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L66)
- Parameters: `layout`: [`SpatialLayout`](../types.ts.mdmd.md#symbol-spatiallayout)

##### `linkPulls` — Summary
Which links pull in a layout: documented references place files by their analyzed connections, containment places
them by their declared directories. The other kind stays in the data to be drawn on demand and moves nothing. A
document's citation of a file pulls by the tuning's lever (`citedByPull`), which at zero leaves it drawn alone, so
that whether such a link should shape the picture can be seen before it is decided (the owner, 2026-10-22).

#### `springShare` {#symbol-springshare}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L73)

##### `springShare` — Summary
How hard a pulling link's spring pulls, as a share of a reference's: the tuning's lever for a document's citation, one for the rest.

#### `Placed` {#symbol-placed}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L78)

##### `Placed` — Summary
A point the simulation placed, or the carry did.

#### `PlaceableNode` {#symbol-placeablenode}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L81)
- Extends: [`SpatialNode`](#symbol-spatialnode)

##### `PlaceableNode` — Summary
What the placement of a new sphere reads of a node beside its position: for a hub its directory, for a file its path.

#### `seededDirection` {#symbol-seededdirection}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L89)
- Returns: [`Placed`](#symbol-placed)

##### `seededDirection` — Summary
A unit vector seeded by the id, the same on every machine, so that a born sphere's direction is reproducible headlessly.

#### `placeNewSpheres` {#symbol-placenewspheres}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L106)
- Parameters: `tuning`: [`ForceGraphTuning`](../types.ts.mdmd.md#symbol-forcegraphtuning); `layout`: [`SpatialLayout`](../types.ts.mdmd.md#symbol-spatiallayout)
- Constraints: [`PlaceableNode`](#symbol-placeablenode)

##### `placeNewSpheres` — Summary
Where the spheres new to the picture start, read from the spheres that already stand somewhere (the carry of ticket C2
of the change-over-time plan): a hub new to the picture starts at the centroid of its placed members, at every depth; any
other new sphere starts beside what it is wired to by a pulling link, its hub in the structure layout or the files it
references in the connections layout, at the mean of those neighbours plus the spring's rest length in a direction seeded
by its id, so that nothing erupts from the origin, where D3 would otherwise seat it. A chain of new spheres is placed one
after another. A sphere with nothing placed to start from is left to D3. The nodes are not changed; the result is the
start of each sphere placed here.

#### `springStrength` {#symbol-springstrength}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L154)
- Parameters: `edge`: `L`; `links`: `L`[]
- Constraints: [`SpatialNode`](#symbol-spatialnode), [`SpatialLink`](#symbol-spatiallink)

##### `springStrength` — Summary
The strength of each spring: one over the smaller of the two ends' pulling-link counts, times `linkStrength`.
This retains D3's spring normalization, not its unequal division of motion between endpoints. A hub-to-leaf
spring keeps full strength because the leaf has degree one. Counts come from pulling links, once per set.

#### `MOTION` {#symbol-motion}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L171)
- Returns: [`MotionSettings`](./forceGraphPhysics.ts.mdmd.md#symbol-motionsettings)

##### `MOTION` — Summary
The motion's step and drag: the probe's smooth control, which the owner found "quite natural" (2026-10-19).

#### `COLLISION_STIFFNESS` {#symbol-collision_stiffness}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L174)

##### `COLLISION_STIFFNESS` — Summary
How hard two spheres closer than their clearance push apart, per unit of overlap.

#### `STILL_FRACTION` {#symbol-still_fraction}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L177)

##### `STILL_FRACTION` — Summary
The largest move of a tick, as a share of the picture's diagonal, below which the spheres count as still.

#### `QUIET_TICKS` {#symbol-quiet_ticks}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L180)

##### `QUIET_TICKS` — Summary
How many still ticks in a row end the easing.

#### `UNFOLDED_FRACTION` {#symbol-unfolded_fraction}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L188)

##### `UNFOLDED_FRACTION` — Summary
The largest move of a tick, as a share of the picture's diagonal, under which a picture unfolding from nothing has
calmed and the tether takes hold where it stands. A tenth of a percent: this repository's pictures pass it after about
210 to 250 ticks from the library's seed and are still some 140 ticks later; held from the seed, which is a ball a
hundredth of the picture's size, they would stay far too small (measured 2026-10-21).

#### `spatialFieldOf` {#symbol-spatialfieldof}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L195)
- Returns: [`SpatialField`](./forceGraphPhysics.ts.mdmd.md#symbol-spatialfield)
- Parameters: `tuning`: [`ForceGraphTuning`](../types.ts.mdmd.md#symbol-forcegraphtuning); `layout`: [`SpatialLayout`](../types.ts.mdmd.md#symbol-spatiallayout)
- Constraints: [`SpatialNode`](#symbol-spatialnode)

##### `spatialFieldOf` — Summary
The field of a picture: its spheres' radii, a spring on each link that pulls in the layout with the rest length and
strength ruled above, and the tuning's repulsion with its reach and approximation, gravity, collision gap and tether.
Links whose ends are not among the nodes are left out, as D3 would refuse them.

#### `MotionStart` {#symbol-motionstart}
- Type: type
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L222)

##### `MotionStart` — Summary
How a motion begins: held from where the spheres stand, for a change of what is shown or a hand, so that the picture
keeps a person's bearings; or unfolding freely until it calms and held there, for a first picture, a layout or new
forces, which rearrange the whole and leave the old places no reference.

#### `MotionForce (interface)` {#symbol-motionforce-interface}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L225)
- Extends: `Force`
- Constraints: [`SpatialNode`](#symbol-spatialnode)

##### `MotionForce (interface)` — Summary
The one force that moves the 3D picture, with what the page asks of it.

#### `MotionSource` {#symbol-motionsource}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L237)
- Constraints: [`SpatialNode`](#symbol-spatialnode)

##### `MotionSource` — Summary
What the motion force reads at every tick.

#### `motionForce (function)` {#symbol-motionforce-function}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L259)
- Returns: [`MotionForce`](#symbol-motionforce-interface)
- Parameters: `source`: [`MotionSource`](#symbol-motionsource)
- Constraints: [`SpatialNode`](#symbol-spatialnode)

##### `motionForce (function)` — Summary
D3's simulation drives the ticks, this force does all the moving (2026-10-21). Each tick it reads the spheres where they
stand, since the carry of a change and a hand move them between ticks, holds every sphere D3 has fixed (`fx`, a hand's
drag), steps the damped motion through the field at the source's strength, writes the positions back and zeroes D3's
velocities, so that D3's own integration adds nothing. A sphere keeps its velocity and its anchor by id when the field is
built again. A picture that has never moved unfolds first. Alpha is ignored: the easing has no schedule, and ends when
the tether holds and the largest move of a tick has stayed under `STILL_FRACTION` of the picture's diagonal for
`QUIET_TICKS` ticks with no sphere held by a hand.

#### `EaseOptions` {#symbol-easeoptions}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L334)

##### `EaseOptions` — Summary
How a headless easing runs: its constant strength, how it begins, and the most ticks it may take.

#### `easeSpatialLayout` {#symbol-easespatiallayout}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L351)
- Parameters: `tuning`: [`ForceGraphTuning`](../types.ts.mdmd.md#symbol-forcegraphtuning); `layout`: [`SpatialLayout`](../types.ts.mdmd.md#symbol-spatiallayout); `_unnamed_`: [`EaseOptions`](#symbol-easeoptions)

##### `easeSpatialLayout` — Summary
Ease a picture headlessly as the page does: D3's simulation seats the spheres without a position, as the library does,
resolves the links and drives the ticks, and the motion force moves the spheres at the strength given until they are
still or `maxTicks` have passed. The picture enters in pieces as the page reveals it (2026-10-28): the first piece,
holding the attention set, in the order given, so that a picture no larger than it is eased exactly as before; after
the hidden ticks the page gives its first picture, a share more at every tick, each sphere placed beside what holds it
as it enters. A first picture unfolds (the default); a change carried from a still picture is held from where its
spheres stand. Inputs are not mutated; the result says whether the picture came to rest.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `d3-force-3d` - `Force`, `SimulationNodeDatum`, `forceLink`, `forceSimulation`
- [`types.ForceGraphTuning`](../types.ts.mdmd.md#symbol-forcegraphtuning) (type-only)
- [`types.SpatialLayout`](../types.ts.mdmd.md#symbol-spatiallayout) (type-only)
- [`forceGraphPhysics.MotionSettings`](./forceGraphPhysics.ts.mdmd.md#symbol-motionsettings)
- [`forceGraphPhysics.SpatialField`](./forceGraphPhysics.ts.mdmd.md#symbol-spatialfield)
- [`forceGraphPhysics.SpatialMotion`](./forceGraphPhysics.ts.mdmd.md#symbol-spatialmotion)
- [`forceGraphPhysics.diagonalOf`](./forceGraphPhysics.ts.mdmd.md#symbol-diagonalof)
- [`forceGraphReveal.REVEAL`](./forceGraphReveal.ts.mdmd.md#symbol-reveal)
- [`forceGraphReveal.RevealSettings`](./forceGraphReveal.ts.mdmd.md#symbol-revealsettings)
- [`forceGraphReveal.nextRevealCount`](./forceGraphReveal.ts.mdmd.md#symbol-nextrevealcount)
- [`forceGraphReveal.revealOrder`](./forceGraphReveal.ts.mdmd.md#symbol-revealorder)
- [`directory-state.under`](./localView/directory-state.ts.mdmd.md#symbol-under)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../../../../layer-3/architectural-decisions.mdmd.md)
- [`.mdmd/layer-3/change-over-time.mdmd.md`](../../../../../../layer-3/change-over-time.mdmd.md)
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
