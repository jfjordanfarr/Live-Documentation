# packages/explorer/src/client/views/forceGraphLayout.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/forceGraphLayout.ts
- Generated At: 2026-10-18T05:36:02.549Z

## Authored
### Purpose
Implements the 3D Local Map’s shared geometry and force settings: symbol-sized spheres, hubs sized by their members, coupling-dependent gaps, size-aware collision clearance, and the rule for which links pull in each layout.

### Notes
Sphere volume grows from one baseline unit plus the documented public-symbol count; a directory hub's volume is the sum of its members' volumes, so that size means exposed surface at every scale (2026-10-14). A logarithmic coupling term shortens surface gaps, bounded below by collision clearance. The library’s degree-normalized spring strengths are retained, over the links that pull: `pullingLinkForce` wraps the engine's link force and hands it only the references in the connections layout and only containment in the structure layout, so the other kind neither pulls nor counts in a spring's degree. A zero-strength spring was tried first and still moved the tree, through D3's degree-normalized split of a spring's motion between its ends, which a unit test caught. D3 resolves the endpoints of only the links it is handed, and three-forcegraph draws no line whose endpoints have no coordinates, so the wrapper resolves the links it holds back against the same nodes, with D3's error for an unknown id; until 2026-10-16 it did not, and in the browser every reference revealed in the structure layout was visible but never drawn, a unit tube left at the origin. The headless helper's own resolution after its ticks went at the same time: D3 had already resolved every link there, since its link force is given them all before the wrapper is. The browser reheats its existing simulation; the headless helper clones inputs and uses the same forces for a deterministic number of ticks. Neither positions nor symbol counts imply runtime call frequency or code complexity.

Created for [the October 13 shared-preset implementation](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-6--shared-presets-and-advanced-tuning-approved-for-implementation).

Gravity and the repulsion's reach (2026-10-17): four forces made the picture before, the spring on each pulling link, the repulsion of every sphere on every other with unbounded reach, the collision, and the library's centring, which only translates the whole so that its mean sits at the origin; nothing drew two unconnected clusters together, so every reheat pushed them apart, which the owner saw as "the microgalaxies drift further apart" under repeated type toggles and read as the simulation being "highly lax" ([Turn 3 of the October 17 session](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-17.1.record.md#turn-3)). `configureSpatialForces` now sets a gravity force (D3's radial force at radius zero: a pull toward the origin in proportion to distance, `tuning.gravity` its strength, none at zero) and the repulsion's `distanceMax` (`tuning.chargeRange`, unbounded at zero), in the browser and headlessly alike; the layout lab's `drift` measure chose the defaults, as ticket C5 of [the change-over-time plan](../../../../../../../.mdmd/layer-3/change-over-time.mdmd.md#open-questions) records, and the owner confirmed the direction: "Boom. Exactly." ([Turn 5](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-17.1.record.md#turn-5)).

The update energy (2026-10-18, the plan's ticket C2): what a membership change puts into the simulation. In D3 a reheat is one number, the alpha the simulation starts from, so the lever is that number (`ForceGraphTuning.updateEnergy`, zero to one) and `updateSchedule` turns it into what the library can be told: the library sets alpha to one on every change and exposes no alpha of its own, so the fraction is applied as the share of alpha the spring, the repulsion and the gravity see, read at every tick through `scaledForce` and `pullingLinkForce`, and the stop as the alpha at which that share falls to the stillness the first picture cools to (`SETTLED_ALPHA`, 0.001); the collision ignores alpha and is never scaled. So a change at one is the full reheat the page made of every change before, three hundred ticks at the library's cooling rate (`LIBRARY_ALPHA_DECAY`, which `settleTicksOf` counts as the library counts); a change at a tenth is a reheat to a tenth that cools to the same stillness in two hundred; at or below the stillness nothing is simulated. [The probe of 2026-10-16](../../../../../../../AI-Agent-Workspace/Probes/2026-10-16/change-over-time/README.md) had stopped its gentle update after fifty ticks by doubling the cooling and stopping at a tenth of alpha, and its own table says the spheres were still moving when it froze them; here every energy cools to the same stillness and the ticks follow from the energy, which is the library's own rule for "settled" and leaves one lever meaning one thing. The carry is `placeNewSpheres`: a sphere that was in the picture keeps its place, a hub new to it starts at the centroid of its placed members, and any other new sphere starts beside what it is wired to by a pulling link (its hub in the structure layout, the files it references in the connections layout) at the spring's rest length in a direction `seededDirection` draws from its id, so that nothing erupts from the origin where D3 would seat it; a sphere with nothing placed to start from is left to D3. `settleSpatialUpdate` is the headless twin of the page's feed, for the lab and the tests. The library's centring force is left as it is: a measurement of 2026-10-18 found that on a toy of six spheres it carries most of a gentle update's move, since it recentres the whole picture in full every tick whatever the alpha, but on this repository's bundles its share is within the noise (the lab record of the day), so it was not changed for this ticket.

`symbolCountOf` (2026-10-18, ticket C4 of [the change-over-time plan](../../../../../../../.mdmd/layer-3/change-over-time.mdmd.md#open-questions)): a sphere's size reads the count a node carries when its symbols' names are not at hand, as at a step of the history, and the names' count otherwise, so that a sphere breathes with its symbols at every step.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SpatialNode` {#symbol-spatialnode}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L8)
- Extends: `SimulationNodeDatum`

##### `SpatialNode` — Summary
The documented interface and mutable position of a file, or of a directory hub, in the spatial layout.

#### `symbolCountOf` {#symbol-symbolcountof}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L18)

##### `symbolCountOf` — Summary
How many public symbols a file exposes: the count it carries, or its names counted.

#### `SpatialLink` {#symbol-spatiallink}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L21)
- Constraints: [`SpatialNode`](#symbol-spatialnode)

##### `SpatialLink` — Summary
One undirected file pair; count is the number of documented references in either direction.

#### `spatialNodeValue` {#symbol-spatialnodevalue}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L34)
- Parameters: `node`: [`SpatialNode`](#symbol-spatialnode); `tuning`: [`ForceGraphTuning`](../types.ts.mdmd.md#symbol-forcegraphtuning)

##### `spatialNodeValue` — Summary
The value is sphere volume. A file's grows with its exposed symbols plus one baseline unit, so a zero-symbol file still
has a visible body; a directory hub's is the sum of its members' volumes, so that size means exposed surface at every
scale (the owner's "pedagogical" invariant, 2026-10-14).

#### `spatialNodeRadius` {#symbol-spatialnoderadius}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L41)
- Parameters: `node`: [`SpatialNode`](#symbol-spatialnode); `tuning`: [`ForceGraphTuning`](../types.ts.mdmd.md#symbol-forcegraphtuning)

##### `spatialNodeRadius` — Summary
Actual sphere radius, shared by rendering, collision clearance and the command's report.

#### `spatialLinkDistance` {#symbol-spatiallinkdistance}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L46)
- Parameters: `link`: [`SpatialLink`](#symbol-spatiallink); `tuning`: [`ForceGraphTuning`](../types.ts.mdmd.md#symbol-forcegraphtuning)

##### `spatialLinkDistance` — Summary
More coupling reduces the desired surface gap with diminishing returns, without changing the node-size meaning.

#### `linkPulls` {#symbol-linkpulls}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L56)
- Parameters: `layout`: [`SpatialLayout`](../types.ts.mdmd.md#symbol-spatiallayout)

##### `linkPulls` — Summary
Which links pull in a layout: documented references place files by their analyzed connections, containment places
them by their declared directories. The other kind stays in the data to be drawn on demand and moves nothing.

#### `pullingLinkForce` {#symbol-pullinglinkforce}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L72)
- Returns: `ForceLink`
- Parameters: `link`: `ForceLink`; `layout`: [`SpatialLayout`](../types.ts.mdmd.md#symbol-spatiallayout)
- Constraints: [`SpatialNode`](#symbol-spatialnode), [`SpatialLink`](#symbol-spatiallink)

##### `pullingLinkForce` — Summary
D3's link force over the links that pull in a layout. It accepts every link like the force it wraps and hands the
inner force only the pulling ones, so that a documented reference drawn on demand in the structure layout neither
pulls nor counts in a spring's degree, and containment never does in the connections layout. Wrapping a wrapper for
another layout starts again from the complete list it was given.

D3 resolves the endpoints of only the links it holds, and three-forcegraph draws no line whose endpoints have no
coordinates, so the wrapper resolves the others against the same nodes, as D3 would and with D3's error for an id
it cannot find: a reference revealed in the structure layout runs between its two spheres (2026-10-16).

#### `SETTLED_ALPHA` {#symbol-settled_alpha}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L120)

##### `SETTLED_ALPHA` — Summary
The alpha below which the engine stops: the stillness the first picture cools to, and every later update with it.

#### `LIBRARY_ALPHA_DECAY` {#symbol-library_alpha_decay}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L123)

##### `LIBRARY_ALPHA_DECAY` — Summary
The library's cooling rate, three-forcegraph's default applied to its simulation at construction, which the page never changes.

#### `FULL_SHARE` {#symbol-full_share}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L126)

##### `FULL_SHARE` — Summary
The forces see all of alpha: the first picture and a change of the forces.

#### `UpdateSchedule (interface)` {#symbol-updateschedule-interface}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L137)

##### `UpdateSchedule (interface)` — Summary
What a membership change does to the simulation under the update energy, the lever of ticket C2 of the change-over-time
plan: the share of alpha the forces see, the alpha the engine stops at, and whether it ticks at all. In D3 a reheat is one
number, the alpha the simulation starts from, so the lever is that number: at one the full reheat the library makes of
every change; at a fraction a reheat to that alpha, which cools at the library's rate and stops at the same stillness as
the first picture, so sooner; at or below the stillness itself nothing is simulated, and the spheres stand where the carry
put them. The library sets alpha to one on every change and exposes no alpha of its own, so the fraction is applied as
the share of alpha the forces see, and the stop as the alpha at which that share falls to the stillness.

#### `updateSchedule (function)` {#symbol-updateschedule-function}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L147)
- Returns: [`UpdateSchedule`](#symbol-updateschedule-interface)

##### `updateSchedule (function)` — Summary
The schedule of a membership change at this energy; see `UpdateSchedule`. Refuses an energy outside zero to one.

#### `settleTicksOf` {#symbol-settleticksof}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L154)

##### `settleTicksOf` — Summary
How many ticks the engine takes to settle after a change at this energy, counted as the library counts them: alpha is checked before each tick and decays in it.

#### `scaledForce` {#symbol-scaledforce}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L169)
- Returns: `F`
- Parameters: `force`: `F`
- Constraints: [`SpatialNode`](#symbol-spatialnode), `Force`

##### `scaledForce` — Summary
A force that sees a share of alpha, read at every tick. D3's accessors are forwarded to the force beneath, so that
configuration still reaches it and a chained setter returns the wrapper; wrapping a wrapper wraps the force beneath it,
so the share is never applied twice. The collision force is never wrapped: D3's collision ignores alpha.

#### `Placed` {#symbol-placed}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L185)

##### `Placed` — Summary
A point the simulation placed, or the carry did.

#### `PlaceableNode` {#symbol-placeablenode}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L188)
- Extends: [`SpatialNode`](#symbol-spatialnode)

##### `PlaceableNode` — Summary
What the placement of a new sphere reads of a node beside its position: for a hub its directory, for a file its path.

#### `seededDirection` {#symbol-seededdirection}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L196)
- Returns: [`Placed`](#symbol-placed)

##### `seededDirection` — Summary
A unit vector seeded by the id, the same on every machine, so that a born sphere's direction is reproducible headlessly.

#### `placeNewSpheres` {#symbol-placenewspheres}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L213)
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

#### `SpatialForceAccess` {#symbol-spatialforceaccess}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L257)
- Constraints: [`SpatialNode`](#symbol-spatialnode)

##### `SpatialForceAccess` — Summary
The force getter/setter shared by D3's simulation and the browser's public force API; setting null removes a force.

#### `configureSpatialForces` {#symbol-configurespatialforces}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L274)
- Parameters: `engine`: [`SpatialForceAccess`](#symbol-spatialforceaccess); `tuning`: [`ForceGraphTuning`](../types.ts.mdmd.md#symbol-forcegraphtuning); `layout`: [`SpatialLayout`](../types.ts.mdmd.md#symbol-spatiallayout)
- Constraints: [`SpatialNode`](#symbol-spatialnode)

##### `configureSpatialForces` — Summary
Apply the same forces in the browser and headlessly; the layout says which links pull.

Four forces made the picture before 2026-10-17: the spring on each pulling link, the repulsion of every sphere on
every other with unbounded reach, the collision that keeps spheres apart, and the library's centring, which only
translates the whole so that its mean sits at the origin. Nothing drew two unconnected clusters together or the whole
inward, so every reheat pushed the clusters a little further apart. Gravity is the restoring force: a pull on every
sphere toward the origin in proportion to its distance, so that the picture has a compact equilibrium it returns to;
the repulsion's reach can be bounded beside it. The spring, the repulsion and the gravity see the given share of alpha,
read at every tick, which is how a membership change is fed less than a full reheat (`updateSchedule`); the collision
ignores alpha and is never scaled.

#### `simulateSpatialLayout` {#symbol-simulatespatiallayout}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L285)
- Parameters: `tuning`: [`ForceGraphTuning`](../types.ts.mdmd.md#symbol-forcegraphtuning); `layout`: [`SpatialLayout`](../types.ts.mdmd.md#symbol-spatiallayout)

##### `simulateSpatialLayout` — Summary
Deterministic cold layout, using the browser's D3 engine and force configuration; inputs are not mutated.

#### `settleSpatialUpdate` {#symbol-settlespatialupdate}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L306)
- Parameters: `tuning`: [`ForceGraphTuning`](../types.ts.mdmd.md#symbol-forcegraphtuning); `layout`: [`SpatialLayout`](../types.ts.mdmd.md#symbol-spatiallayout)

##### `settleSpatialUpdate` — Summary
Feed a membership change to a simulation headlessly as the page does: the spheres stand where the carry put them (the
ones without a position seated by D3), the forces see the energy's share of alpha, and the engine ticks until it would
stop, at the library's cooling rate. Returns the placed nodes, the resolved links and the ticks it took; at an energy at or
below the settled alpha nothing is simulated. Inputs are not mutated.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `d3-force-3d` - `Force`, `ForceLink`, `ForceManyBody`, `SimulationNodeDatum`, `forceCenter`, `forceCollide`, `forceLink`, `forceManyBody`, `forceRadial`, `forceSimulation`
- [`types.ForceGraphTuning`](../types.ts.mdmd.md#symbol-forcegraphtuning) (type-only)
- [`types.SpatialLayout`](../types.ts.mdmd.md#symbol-spatiallayout) (type-only)
- [`directory-state.under`](./localView/directory-state.ts.mdmd.md#symbol-under)
- [`d3-force-3d`](../../shared/d3-force-3d.ts.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->
