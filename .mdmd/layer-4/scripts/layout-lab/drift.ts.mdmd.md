# scripts/layout-lab/drift.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/layout-lab/drift.ts
- Generated At: 2026-10-18T00:31:16.258Z

## Authored
### Purpose
Measures, headlessly, what repeated membership changes do to the 3D Local Map's picture: the drift the owner saw in the product on 2026-10-17, "just enable and disable certain archetypes/file types over and over and see the microgalaxies drift further apart" ([Turn 3 of the October 17 session](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-17.1.record.md#turn-3)). It exists so that the restoring force the owner asked for in place of held hubs, "a weak gravity, toward the origin or toward a sphere's parent hub" ([Turn 5](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-17.1.record.md#turn-5)), is chosen by a measurement and not by a guess: ticket C5 of [the change-over-time plan](../../../layer-3/change-over-time.mdmd.md#open-questions).

### Notes
The cycle is the page's own: the full picture settled by the shared forces, one file type removed and the picture re-settled, the type restored and re-settled, each change a full reheat from the carried positions as `forceGraphView.ts` does it today, with the page's rules for what carries across a change (a sphere keeps its place; a hub new to the picture starts at the centroid of its members). Two measures per cycle: the picture's extent as the root-mean-square distance of every sphere from the centroid, which one far sphere cannot swing, beside the box's diagonal; and the mean and greatest move of the spheres that never left. A simulation whose equilibrium is compact leaves the extent where it began; before gravity there was no equilibrium between unconnected clusters, only repulsion, and the extent grew with every cycle. The toy test holds both halves: two clusters that never reference each other spread by more than a fifth over five cycles without gravity and stay within a tenth with it. The `drift` verb of `lab.ts` sweeps gravity and the repulsion's reach over a built bundle and writes the table under the day's probe folder; the measurements that chose the shipped default are recorded there.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Placed` {#symbol-placed}
- Type: interface
- Source: [source](../../../../scripts/layout-lab/drift.ts#L21)

##### `Placed` — Summary
A point the simulation placed.

#### `DriftCycle` {#symbol-driftcycle}
- Type: interface
- Source: [source](../../../../scripts/layout-lab/drift.ts#L24)

##### `DriftCycle` — Summary
The measure of one cycle: the picture's extent after the toggled files came back, and how far the others moved.

#### `DriftReport` {#symbol-driftreport}
- Type: interface
- Source: [source](../../../../scripts/layout-lab/drift.ts#L37)

##### `DriftReport` — Summary
What one setting of the forces does over the cycles.

#### `extentOf` {#symbol-extentof}
- Type: function
- Source: [source](../../../../scripts/layout-lab/drift.ts#L51)

##### `extentOf` — Summary
Root-mean-square distance from the centroid: the picture's spread, insensitive to one far sphere.

#### `diagonalOf` {#symbol-diagonalof}
- Type: function
- Source: [source](../../../../scripts/layout-lab/drift.ts#L58)

##### `diagonalOf` — Summary
The diagonal of the box around every point.

#### `toggledArchetype` {#symbol-toggledarchetype}
- Type: function
- Source: [source](../../../../scripts/layout-lab/drift.ts#L71)

##### `toggledArchetype` — Summary
The archetype a `--toggle` option names: the filter's plural (`tests`, `assets`) to the doc's singular archetype
(`test`, `asset`), or null for `none`, the control that reheats the picture with no change at all. Any other word is
refused, since a toggle that matches nothing would measure the control while claiming a toggle (found 2026-10-17).

#### `carryPositions` {#symbol-carrypositions}
- Type: function
- Source: [source](../../../../scripts/layout-lab/drift.ts#L82)
- Returns: [`SpatialNode`](../../packages/explorer/src/client/views/forceGraphLayout.ts.mdmd.md#symbol-spatialnode)[]
- Parameters: `previous`: `ReadonlyMap`

##### `carryPositions` — Summary
Carry positions across a membership change as the page does: a sphere that was in the picture keeps its place, and a
hub new to the picture starts at the centroid of the members that already stand somewhere (forceGraphView.ts, 2026-10-14).

#### `measureDrift` {#symbol-measuredrift}
- Type: function
- Source: [source](../../../../scripts/layout-lab/drift.ts#L105)
- Returns: [`DriftReport`](#symbol-driftreport)
- Parameters: `graph`: [`ExplorerGraphPayload`](../../packages/explorer/src/shared/types.ts.mdmd.md#symbol-explorergraphpayload); `node`: [`ExplorerNodePayload`](../../packages/explorer/src/shared/types.ts.mdmd.md#symbol-explorernodepayload); `tuning`: [`ForceGraphTuning`](../../packages/explorer/src/client/types.ts.mdmd.md#symbol-forcegraphtuning); `layout`: [`SpatialLayout`](../../packages/explorer/src/client/types.ts.mdmd.md#symbol-spatiallayout)

##### `measureDrift` — Summary
Settle the full picture, then toggle the given files out and back in for the given number of cycles, each change a
full reheat of the page's forces from the carried positions, and measure the picture after every restore.

#### `renderDriftReports` {#symbol-renderdriftreports}
- Type: function
- Source: [source](../../../../scripts/layout-lab/drift.ts#L138)

##### `renderDriftReports` — Summary
A table a person reads: one row per setting, the extent's growth across the cycles and the unchanged spheres' moves.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.ForceGraphTuning`](../../packages/explorer/src/client/types.ts.mdmd.md#symbol-forcegraphtuning) (type-only)
- [`types.SpatialLayout`](../../packages/explorer/src/client/types.ts.mdmd.md#symbol-spatiallayout) (type-only)
- [`forceGraphData.SpatialGraphNode`](../../packages/explorer/src/client/views/forceGraphData.ts.mdmd.md#symbol-spatialgraphnode)
- [`forceGraphData.spatialGraphOf`](../../packages/explorer/src/client/views/forceGraphData.ts.mdmd.md#symbol-spatialgraphof)
- [`forceGraphLayout.SpatialLink`](../../packages/explorer/src/client/views/forceGraphLayout.ts.mdmd.md#symbol-spatiallink)
- [`forceGraphLayout.SpatialNode`](../../packages/explorer/src/client/views/forceGraphLayout.ts.mdmd.md#symbol-spatialnode)
- [`forceGraphLayout.simulateSpatialLayout`](../../packages/explorer/src/client/views/forceGraphLayout.ts.mdmd.md#symbol-simulatespatiallayout)
- [`directory-state.under`](../../packages/explorer/src/client/views/localView/directory-state.ts.mdmd.md#symbol-under)
- [`types.ExplorerGraphPayload`](../../packages/explorer/src/shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`types.ExplorerNodePayload`](../../packages/explorer/src/shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->
