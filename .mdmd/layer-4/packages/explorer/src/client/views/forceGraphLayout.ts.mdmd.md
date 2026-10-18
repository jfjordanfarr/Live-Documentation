# packages/explorer/src/client/views/forceGraphLayout.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/forceGraphLayout.ts
- Generated At: 2026-10-17T23:33:28.892Z

## Authored
### Purpose
Implements the 3D Local Map’s shared geometry and force settings: symbol-sized spheres, hubs sized by their members, coupling-dependent gaps, size-aware collision clearance, and the rule for which links pull in each layout.

### Notes
Sphere volume grows from one baseline unit plus the documented public-symbol count; a directory hub's volume is the sum of its members' volumes, so that size means exposed surface at every scale (2026-10-14). A logarithmic coupling term shortens surface gaps, bounded below by collision clearance. The library’s degree-normalized spring strengths are retained, over the links that pull: `pullingLinkForce` wraps the engine's link force and hands it only the references in the connections layout and only containment in the structure layout, so the other kind neither pulls nor counts in a spring's degree. A zero-strength spring was tried first and still moved the tree, through D3's degree-normalized split of a spring's motion between its ends, which a unit test caught. D3 resolves the endpoints of only the links it is handed, and three-forcegraph draws no line whose endpoints have no coordinates, so the wrapper resolves the links it holds back against the same nodes, with D3's error for an unknown id; until 2026-10-16 it did not, and in the browser every reference revealed in the structure layout was visible but never drawn, a unit tube left at the origin. The headless helper's own resolution after its ticks went at the same time: D3 had already resolved every link there, since its link force is given them all before the wrapper is. The browser reheats its existing simulation; the headless helper clones inputs and uses the same forces for a deterministic number of ticks. Neither positions nor symbol counts imply runtime call frequency or code complexity.

Created for [the October 13 shared-preset implementation](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-6--shared-presets-and-advanced-tuning-approved-for-implementation).

Gravity and the repulsion's reach (2026-10-17): four forces made the picture before, the spring on each pulling link, the repulsion of every sphere on every other with unbounded reach, the collision, and the library's centring, which only translates the whole so that its mean sits at the origin; nothing drew two unconnected clusters together, so every reheat pushed them apart, which the owner saw as "the microgalaxies drift further apart" under repeated type toggles and read as the simulation being "highly lax" ([Turn 3 of the October 17 session](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-17.1.record.md#turn-3)). `configureSpatialForces` now sets a gravity force (D3's radial force at radius zero: a pull toward the origin in proportion to distance, `tuning.gravity` its strength, none at zero) and the repulsion's `distanceMax` (`tuning.chargeRange`, unbounded at zero), in the browser and headlessly alike; the layout lab's `drift` measure chose the defaults, as ticket C5 of [the change-over-time plan](../../../../../../../.mdmd/layer-3/change-over-time.mdmd.md#open-questions) records, and the owner confirmed the direction: "Boom. Exactly." ([Turn 5](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-17.1.record.md#turn-5)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SpatialNode` {#symbol-spatialnode}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L7)
- Extends: `SimulationNodeDatum`

##### `SpatialNode` — Summary
The documented interface and mutable position of a file, or of a directory hub, in the spatial layout.

#### `SpatialLink` {#symbol-spatiallink}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L15)
- Constraints: [`SpatialNode`](#symbol-spatialnode)

##### `SpatialLink` — Summary
One undirected file pair; count is the number of documented references in either direction.

#### `spatialNodeValue` {#symbol-spatialnodevalue}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L28)
- Parameters: `node`: [`SpatialNode`](#symbol-spatialnode); `tuning`: [`ForceGraphTuning`](../types.ts.mdmd.md#symbol-forcegraphtuning)

##### `spatialNodeValue` — Summary
The value is sphere volume. A file's grows with its exposed symbols plus one baseline unit, so a zero-symbol file still
has a visible body; a directory hub's is the sum of its members' volumes, so that size means exposed surface at every
scale (the owner's "pedagogical" invariant, 2026-10-14).

#### `spatialNodeRadius` {#symbol-spatialnoderadius}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L35)
- Parameters: `node`: [`SpatialNode`](#symbol-spatialnode); `tuning`: [`ForceGraphTuning`](../types.ts.mdmd.md#symbol-forcegraphtuning)

##### `spatialNodeRadius` — Summary
Actual sphere radius, shared by rendering, collision clearance and the command's report.

#### `spatialLinkDistance` {#symbol-spatiallinkdistance}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L40)
- Parameters: `link`: [`SpatialLink`](#symbol-spatiallink); `tuning`: [`ForceGraphTuning`](../types.ts.mdmd.md#symbol-forcegraphtuning)

##### `spatialLinkDistance` — Summary
More coupling reduces the desired surface gap with diminishing returns, without changing the node-size meaning.

#### `linkPulls` {#symbol-linkpulls}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L50)
- Parameters: `layout`: [`SpatialLayout`](../types.ts.mdmd.md#symbol-spatiallayout)

##### `linkPulls` — Summary
Which links pull in a layout: documented references place files by their analyzed connections, containment places
them by their declared directories. The other kind stays in the data to be drawn on demand and moves nothing.

#### `pullingLinkForce` {#symbol-pullinglinkforce}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L66)
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

#### `SpatialForceAccess` {#symbol-spatialforceaccess}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L114)
- Constraints: [`SpatialNode`](#symbol-spatialnode)

##### `SpatialForceAccess` — Summary
The force getter/setter shared by D3's simulation and the browser's public force API; setting null removes a force.

#### `configureSpatialForces` {#symbol-configurespatialforces}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L129)
- Parameters: `engine`: [`SpatialForceAccess`](#symbol-spatialforceaccess); `tuning`: [`ForceGraphTuning`](../types.ts.mdmd.md#symbol-forcegraphtuning); `layout`: [`SpatialLayout`](../types.ts.mdmd.md#symbol-spatiallayout)
- Constraints: [`SpatialNode`](#symbol-spatialnode)

##### `configureSpatialForces` — Summary
Apply the same forces in the browser and headlessly; the layout says which links pull.

Four forces made the picture before 2026-10-17: the spring on each pulling link, the repulsion of every sphere on
every other with unbounded reach, the collision that keeps spheres apart, and the library's centring, which only
translates the whole so that its mean sits at the origin. Nothing drew two unconnected clusters together or the whole
inward, so every reheat pushed the clusters a little further apart. Gravity is the restoring force: a pull on every
sphere toward the origin in proportion to its distance, so that the picture has a compact equilibrium it returns to;
the repulsion's reach can be bounded beside it.

#### `simulateSpatialLayout` {#symbol-simulatespatiallayout}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L140)
- Parameters: `tuning`: [`ForceGraphTuning`](../types.ts.mdmd.md#symbol-forcegraphtuning); `layout`: [`SpatialLayout`](../types.ts.mdmd.md#symbol-spatiallayout)

##### `simulateSpatialLayout` — Summary
Deterministic cold layout, using the browser's D3 engine and force configuration; inputs are not mutated.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `d3-force-3d` - `Force`, `ForceLink`, `ForceManyBody`, `SimulationNodeDatum`, `forceCenter`, `forceCollide`, `forceLink`, `forceManyBody`, `forceRadial`, `forceSimulation`
- [`types.ForceGraphTuning`](../types.ts.mdmd.md#symbol-forcegraphtuning) (type-only)
- [`types.SpatialLayout`](../types.ts.mdmd.md#symbol-spatiallayout) (type-only)
- [`d3-force-3d`](../../shared/d3-force-3d.ts.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->
