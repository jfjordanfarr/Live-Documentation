# packages/explorer/src/client/views/forceGraphLayout.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/forceGraphLayout.ts
- Generated At: 2026-10-13T19:38:16.168Z

## Authored
### Purpose
Implements the 3D Local Map’s shared geometry and force settings, including symbol-sized spheres, coupling-dependent gaps and size-aware collision clearance.

### Notes
Sphere volume grows from one baseline unit plus the documented public-symbol count. A logarithmic coupling term shortens surface gaps, bounded below by collision clearance. The library’s degree-normalized spring strengths are retained. The browser reheats its existing simulation; the headless helper clones inputs and uses the same forces for a deterministic number of ticks. Neither positions nor symbol counts imply runtime call frequency or code complexity.

Created for [the October 13 shared-preset implementation](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-6--shared-presets-and-advanced-tuning-approved-for-implementation).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SpatialNode` {#symbol-spatialnode}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L7)
- Extends: `SimulationNodeDatum`

##### `SpatialNode` — Summary
The documented interface and mutable position of a file in the spatial layout.

#### `SpatialLink` {#symbol-spatiallink}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L13)
- Constraints: [`SpatialNode`](#symbol-spatialnode)

##### `SpatialLink` — Summary
One undirected file pair; count is the number of documented references in either direction.

#### `spatialNodeValue` {#symbol-spatialnodevalue}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L20)
- Parameters: `node`: [`SpatialNode`](#symbol-spatialnode); `tuning`: [`ForceGraphTuning`](../types.ts.mdmd.md#symbol-forcegraphtuning)

##### `spatialNodeValue` — Summary
The value is sphere volume; zero-symbol files still have a visible body.

#### `spatialNodeRadius` {#symbol-spatialnoderadius}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L25)
- Parameters: `node`: [`SpatialNode`](#symbol-spatialnode); `tuning`: [`ForceGraphTuning`](../types.ts.mdmd.md#symbol-forcegraphtuning)

##### `spatialNodeRadius` — Summary
Actual sphere radius, shared by rendering, collision clearance and the command's report.

#### `spatialLinkDistance` {#symbol-spatiallinkdistance}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L30)
- Parameters: `link`: [`SpatialLink`](#symbol-spatiallink); `tuning`: [`ForceGraphTuning`](../types.ts.mdmd.md#symbol-forcegraphtuning)

##### `spatialLinkDistance` — Summary
More coupling reduces the desired surface gap with diminishing returns, without changing the node-size meaning.

#### `SpatialForceAccess` {#symbol-spatialforceaccess}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L37)
- Constraints: [`SpatialNode`](#symbol-spatialnode)

##### `SpatialForceAccess` — Summary
The force getter/setter shared by D3's simulation and the browser's public force API.

#### `configureSpatialForces` {#symbol-configurespatialforces}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L43)
- Parameters: `engine`: [`SpatialForceAccess`](#symbol-spatialforceaccess); `tuning`: [`ForceGraphTuning`](../types.ts.mdmd.md#symbol-forcegraphtuning)
- Constraints: [`SpatialNode`](#symbol-spatialnode)

##### `configureSpatialForces` — Summary
Apply the same forces in the browser and headlessly, retaining D3's degree-normalized spring strengths.

#### `simulateSpatialLayout` {#symbol-simulatespatiallayout}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts#L53)
- Parameters: `tuning`: [`ForceGraphTuning`](../types.ts.mdmd.md#symbol-forcegraphtuning)

##### `simulateSpatialLayout` — Summary
Deterministic cold layout, using the browser's D3 engine and force configuration; inputs are not mutated.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `d3-force-3d` - `Force`, `ForceLink`, `ForceManyBody`, `SimulationNodeDatum`, `forceCenter`, `forceCollide`, `forceLink`, `forceManyBody`, `forceSimulation`
- [`types.ForceGraphTuning`](../types.ts.mdmd.md#symbol-forcegraphtuning) (type-only)
- [`d3-force-3d`](../../shared/d3-force-3d.ts.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->
