# scripts/layout-lab/drift.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/layout-lab/drift.ts
- Generated At: 2026-10-22T16:47:57.155Z

## Authored
### Purpose
Measures, headlessly, what repeated membership changes do to the 3D Local Map's picture: the drift the owner saw in the product on 2026-10-17, "just enable and disable certain archetypes/file types over and over and see the microgalaxies drift further apart" ([Turn 3 of the October 17 session](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-17.1.record.md#turn-3)). It exists so that the restoring force the owner asked for in place of held hubs, "a weak gravity, toward the origin or toward a sphere's parent hub" ([Turn 5](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-17.1.record.md#turn-5)), is chosen by a measurement and not by a guess: ticket C5 of [the change-over-time plan](../../../layer-3/change-over-time.mdmd.md#open-questions).

### Notes
The cycle is the page's own: the full picture settled by the shared forces, one file type removed and the picture re-settled, the type restored and re-settled, each change fed from the carried positions as `forceGraphView.ts` feeds it, with the page's rules for what carries across a change. Two measures per cycle: the picture's extent as the root-mean-square distance of every sphere from the centroid, which one far sphere cannot swing, beside the box's diagonal; and the mean and greatest move of the spheres that never left. A simulation whose equilibrium is compact leaves the extent where it began; before gravity there was no equilibrium between unconnected clusters, only repulsion, and the extent grew with every cycle. The toy test holds both halves: two clusters that never reference each other spread by more than a fifth over five cycles without gravity and stay within a tenth with it. The `drift` verb of `lab.ts` sweeps gravity and the repulsion's reach over a built bundle and writes the table under the day's probe folder; the measurements that chose the shipped default are recorded there.

Since 2026-10-18, for ticket C2 of the same plan, each change is fed by the tuning's update energy through the page's own `settleSpatialUpdate`, a full reheat at one (which reproduces the measurements of 2026-10-17), a reheat to the fraction at a fraction, placement alone at zero, and every cycle reports the ticks the engine took to settle the removal and the restore beside the moves. The carry is the page's rule and no longer a copy of it: `carryPositions` restores the known positions and hands the rest to `placeNewSpheres`, so that a hub new to the picture starts at its members' centroid and a born file beside its hub, as the page places them. The sweep that chose the energy's default is under `AI-Agent-Workspace/Probes/2026-10-18/layout-lab/`.

The table gained a Spring column on 2026-10-18, the springs' strength the report was measured at, beside the energy, the gravity and the reach.

Since 2026-10-21 the measure runs the page's motion: the first picture unfolds through `easeSpatialLayout` until still, and each change is eased from the carried positions, held where the spheres stand, at the update energy, which is a constant strength now and no longer a reheat; every easing stops when still or at `--ticks`, and the settle column is the range of ticks the changes took. The table gained a Tether column ([Turn 5](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-21.1.record.md#turn-5)).

The table gained an Approximation column on 2026-10-28, the repulsion's approximation the report was measured at, beside the reach.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Placed` {#symbol-placed}
- Type: unknown
- Source: [source](../../../../scripts/layout-lab/drift.ts#L20)

#### `DriftCycle` {#symbol-driftcycle}
- Type: interface
- Source: [source](../../../../scripts/layout-lab/drift.ts#L23)

##### `DriftCycle` — Summary
The measure of one cycle: the picture's extent after the toggled files came back, how far the others moved, and how long each change took to settle.

#### `DriftReport` {#symbol-driftreport}
- Type: interface
- Source: [source](../../../../scripts/layout-lab/drift.ts#L38)

##### `DriftReport` — Summary
What one setting of the forces does over the cycles.

#### `extentOf` {#symbol-extentof}
- Type: function
- Source: [source](../../../../scripts/layout-lab/drift.ts#L53)

##### `extentOf` — Summary
Root-mean-square distance from the centroid: the picture's spread, insensitive to one far sphere.

#### `diagonalOf` {#symbol-diagonalof}
- Type: function
- Source: [source](../../../../scripts/layout-lab/drift.ts#L60)

##### `diagonalOf` — Summary
The diagonal of the box around every point.

#### `toggledArchetype` {#symbol-toggledarchetype}
- Type: function
- Source: [source](../../../../scripts/layout-lab/drift.ts#L73)

##### `toggledArchetype` — Summary
The archetype a `--toggle` option names: the filter's plural (`tests`, `assets`) to the doc's singular archetype
(`test`, `asset`), or null for `none`, the control that reheats the picture with no change at all. Any other word is
refused, since a toggle that matches nothing would measure the control while claiming a toggle (found 2026-10-17).

#### `carryPositions` {#symbol-carrypositions}
- Type: function
- Source: [source](../../../../scripts/layout-lab/drift.ts#L85)
- Returns: [`SpatialNode`](../../packages/explorer/src/client/views/forceGraphLayout.ts.mdmd.md#symbol-spatialnode)[]
- Parameters: `previous`: `ReadonlyMap`; `tuning`: [`ForceGraphTuning`](../../packages/explorer/src/client/types.ts.mdmd.md#symbol-forcegraphtuning); `layout`: [`SpatialLayout`](../../packages/explorer/src/client/types.ts.mdmd.md#symbol-spatiallayout)

##### `carryPositions` — Summary
Carry positions across a membership change as the page does: a sphere that was in the picture keeps its place, and the
spheres new to it start beside what holds them by the page's own rule, `placeNewSpheres` (a hub at its members' centroid,
a file at its hub's or its neighbours' rest length), which this measure shares with the page since 2026-10-18.

#### `measureDrift` {#symbol-measuredrift}
- Type: function
- Source: [source](../../../../scripts/layout-lab/drift.ts#L105)
- Returns: [`DriftReport`](#symbol-driftreport)
- Parameters: `graph`: [`ExplorerGraphPayload`](../../packages/explorer/src/shared/types.ts.mdmd.md#symbol-explorergraphpayload); `node`: [`ExplorerNodePayload`](../../packages/explorer/src/shared/types.ts.mdmd.md#symbol-explorernodepayload); `tuning`: [`ForceGraphTuning`](../../packages/explorer/src/client/types.ts.mdmd.md#symbol-forcegraphtuning); `layout`: [`SpatialLayout`](../../packages/explorer/src/client/types.ts.mdmd.md#symbol-spatiallayout)

##### `measureDrift` — Summary
Ease the full picture until still, then toggle the given files out and back in for the given number of cycles, each
change eased from the carried positions at the tuning's update energy, held where the spheres stand, as the page eases
it, and measure the picture after every restore. The first picture unfolds at full strength, as the page's does; every
easing stops when still or at the given bound of ticks.

#### `rangeOf` {#symbol-rangeof}
- Type: function
- Source: [source](../../../../scripts/layout-lab/drift.ts#L142)

##### `rangeOf` — Summary
The least and the greatest of some counts, as "a to b", or the one count they all are.

#### `renderDriftReports` {#symbol-renderdriftreports}
- Type: function
- Source: [source](../../../../scripts/layout-lab/drift.ts#L148)

##### `renderDriftReports` — Summary
A table a person reads: one row per setting, the extent's growth across the cycles, the unchanged spheres' moves and the ticks each change took to be still.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.ForceGraphTuning`](../../packages/explorer/src/client/types.ts.mdmd.md#symbol-forcegraphtuning) (type-only)
- [`types.SpatialLayout`](../../packages/explorer/src/client/types.ts.mdmd.md#symbol-spatiallayout) (type-only)
- [`forceGraphData.SpatialGraphNode`](../../packages/explorer/src/client/views/forceGraphData.ts.mdmd.md#symbol-spatialgraphnode)
- [`forceGraphData.spatialGraphOf`](../../packages/explorer/src/client/views/forceGraphData.ts.mdmd.md#symbol-spatialgraphof)
- [`forceGraphLayout.Placed`](../../packages/explorer/src/client/views/forceGraphLayout.ts.mdmd.md#symbol-placed)
- [`forceGraphLayout.SpatialLink`](../../packages/explorer/src/client/views/forceGraphLayout.ts.mdmd.md#symbol-spatiallink)
- [`forceGraphLayout.SpatialNode`](../../packages/explorer/src/client/views/forceGraphLayout.ts.mdmd.md#symbol-spatialnode)
- [`forceGraphLayout.easeSpatialLayout`](../../packages/explorer/src/client/views/forceGraphLayout.ts.mdmd.md#symbol-easespatiallayout)
- [`forceGraphLayout.placeNewSpheres`](../../packages/explorer/src/client/views/forceGraphLayout.ts.mdmd.md#symbol-placenewspheres)
- [`types.ExplorerGraphPayload`](../../packages/explorer/src/shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`types.ExplorerNodePayload`](../../packages/explorer/src/shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../layer-3/architectural-decisions.mdmd.md)
- [`.mdmd/layer-3/change-over-time.mdmd.md`](../../../layer-3/change-over-time.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
