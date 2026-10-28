# scripts/layout-lab/approximation.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/layout-lab/approximation.ts
- Generated At: 2026-10-28T18:35:58.822Z

## Authored
### Purpose
Measures, headlessly and against the exact sum as the oracle, what each setting of the 3D field's `approximation` buys and costs: one evaluation's time at D3's seed of a large bundle, the forces' error there and at the exact field's rest, the page's first tick, and the pictures eased to rest from one seed, beside two measures of the noise a setting's differences should be judged against.

### Notes
Made on 2026-10-28 for the owner's decision of that day that an approximation may be the field's default, after the T3 bundle's 3D view froze on 2026-10-27; the `approximation` verb of [`lab.ts`](lab.ts.mdmd.md) runs it, and the run report of that day, with the proposal for the default, is [`AI-Agent-Workspace/Probes/2026-10-28/approximation/README.md`](../../../../AI-Agent-Workspace/Probes/2026-10-28/approximation/README.md).

`savedPicture` builds the picture a saved address shows in 3D, as the page does: every file the address's filters admit is simulated, and the files it selects, pins or asks a path to are kept whatever their type; its layout settings apply over the defaults. A large bundle is read where it lies, never rebuilt. `timeEvaluations` seats the picture's first spheres where D3 seats a first picture and takes the median of several evaluations after one to warm the engine, three of the exact sum at tens of thousands of spheres. `firstTick` takes the page's first tick through the headless twin and counts the evaluations by wrapping the field's one entry for the tick's length, as the T3 diagnosis counted them.

`forceErrors` measures a setting's error against the exact repulsion, the exact field less the same field without charge, since the approximation changes the repulsion alone and at a picture at rest the whole field's forces nearly vanish. `restPictures` eases the page's cold-start picture of a bundle at each setting from one seed through the lab's spatial report and says how far each sphere stands from the exact rest, as a share of the diagonal. Two rows measure noise: the exact sum taken in another order, every cell opened, which on this repository's and the estate's pictures moved nothing; and the exact rest eased again from where it stopped, held there, which is how surely the motion's stillness places a sphere at all, and the yardstick a setting's shift is judged by.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SavedPicture (interface)` {#symbol-savedpicture-interface}
- Type: interface
- Source: [source](../../../../scripts/layout-lab/approximation.ts#L32)

##### `SavedPicture (interface)` — Summary
A picture of a large bundle as a saved address shows it in 3D: every sphere it simulates, the links, and the forces.

#### `savedPicture (function)` {#symbol-savedpicture-function}
- Type: function
- Source: [source](../../../../scripts/layout-lab/approximation.ts#L44)
- Returns: [`SavedPicture`](#symbol-savedpicture-interface)
- Parameters: `data`: [`StaticExplorerData`](../../packages/explorer/src/shared/staticExplorerData.ts.mdmd.md#symbol-staticexplorerdata)

##### `savedPicture (function)` — Summary
The 3D picture a saved address shows of a bundle: the file-type filters it names, with the files it selects, pins or
asks a path to kept whatever their type, as the page keeps them, every other file simulated; and its layout settings
over the defaults.

#### `seatedPrefix` {#symbol-seatedprefix}
- Type: function
- Source: [source](../../../../scripts/layout-lab/approximation.ts#L63)
- Parameters: `picture`: [`SavedPicture`](#symbol-savedpicture-interface)

##### `seatedPrefix` — Summary
The first `count` spheres of a picture with the links among them, where D3 seats a first picture.

#### `EvaluationTiming` {#symbol-evaluationtiming}
- Type: interface
- Source: [source](../../../../scripts/layout-lab/approximation.ts#L73)

##### `EvaluationTiming` — Summary
What one evaluation of the field took at one setting, the median of several after one to warm the engine.

#### `timeEvaluations` {#symbol-timeevaluations}
- Type: function
- Source: [source](../../../../scripts/layout-lab/approximation.ts#L84)
- Returns: [`EvaluationTiming`](#symbol-evaluationtiming)[]
- Parameters: `picture`: [`SavedPicture`](#symbol-savedpicture-interface)

##### `timeEvaluations` — Summary
Time one evaluation of each setting's field over the same seated spheres.

#### `FirstTick (interface)` {#symbol-firsttick-interface}
- Type: interface
- Source: [source](../../../../scripts/layout-lab/approximation.ts#L108)

##### `FirstTick (interface)` — Summary
One first tick as the page takes it: the field built, the motion begun from D3's seed, one tick, every evaluation counted.

#### `firstTick (function)` {#symbol-firsttick-function}
- Type: function
- Source: [source](../../../../scripts/layout-lab/approximation.ts#L119)
- Returns: [`FirstTick`](#symbol-firsttick-interface)
- Parameters: `picture`: [`SavedPicture`](#symbol-savedpicture-interface)

##### `firstTick (function)` — Summary
The page's first tick of a whole picture at one setting, through the headless twin of the page: the evaluations are
counted by wrapping the field's one entry for the length of the tick, and the wrapper is removed after it.

#### `ForceError` {#symbol-forceerror}
- Type: interface
- Source: [source](../../../../scripts/layout-lab/approximation.ts#L133)

##### `ForceError` — Summary
How far a setting's forces stand from the exact ones at some positions, measured against the exact repulsion's own.

#### `forceErrors` {#symbol-forceerrors}
- Type: function
- Source: [source](../../../../scripts/layout-lab/approximation.ts#L150)
- Returns: [`ForceError`](#symbol-forceerror)[]
- Parameters: `tuning`: [`ForceGraphTuning`](../../packages/explorer/src/client/types.ts.mdmd.md#symbol-forcegraphtuning); `layout`: [`SpatialLayout`](../../packages/explorer/src/client/types.ts.mdmd.md#symbol-spatiallayout)

##### `forceErrors` — Summary
The error of each setting's forces at these positions. The approximation changes the repulsion alone, so the error is
the whole field's difference from the exact field's, and its measure is the exact repulsion, the exact field less the
same field without charge: at a picture at rest the whole field's forces nearly vanish and would measure nothing.

#### `RestPicture` {#symbol-restpicture}
- Type: interface
- Source: [source](../../../../scripts/layout-lab/approximation.ts#L175)

##### `RestPicture` — Summary
A picture eased to rest from D3's seed at one setting, beside the exact field's rest from the same seed.

#### `RestResolution` {#symbol-restresolution}
- Type: interface
- Source: [source](../../../../scripts/layout-lab/approximation.ts#L199)

##### `RestResolution` — Summary
How exactly the motion settles the exact field's picture: the exact rest eased again, held where it stopped as the page
holds a picture it moves again, and how far its spheres go. A rest that stops when every sphere moves less than a share
of the diagonal a tick is only that sure of where the spheres belong, and a setting that moves them less than this moves
them within the motion's own resolution.

#### `restPictures` {#symbol-restpictures}
- Type: function
- Source: [source](../../../../scripts/layout-lab/approximation.ts#L213)
- Parameters: `graph`: [`ExplorerGraphPayload`](../../packages/explorer/src/shared/types.ts.mdmd.md#symbol-explorergraphpayload); `run`: [`ScopeRun`](./scopes.ts.mdmd.md#symbol-scoperun); `tuning`: [`ForceGraphTuning`](../../packages/explorer/src/client/types.ts.mdmd.md#symbol-forcegraphtuning); `layout`: [`SpatialLayout`](../../packages/explorer/src/client/types.ts.mdmd.md#symbol-spatiallayout)

##### `restPictures` — Summary
Ease the page's cold-start picture of a scope's bundle (tests shown, assets hidden) to rest at each setting, from the
same seed, and compare each rest with the exact field's, beside the exact rest eased again as the measure of how surely
the motion places a sphere. The exact rest's positions are returned too, for the error of the forces at rest.

#### `ApproximationReport` {#symbol-approximationreport}
- Type: interface
- Source: [source](../../../../scripts/layout-lab/approximation.ts#L246)

##### `ApproximationReport` — Summary
Everything one run measured, for the report and its JSON companion.

#### `renderApproximationReport` {#symbol-renderapproximationreport}
- Type: function
- Source: [source](../../../../scripts/layout-lab/approximation.ts#L262)
- Parameters: `report`: [`ApproximationReport`](#symbol-approximationreport)

##### `renderApproximationReport` — Summary
The tables a person reads, with the run's settings beside them.

#### `restSubject` {#symbol-restsubject}
- Type: const
- Source: [source](../../../../scripts/layout-lab/approximation.ts#L286)

##### `restSubject` — Summary
The subject a scope's rows of error are reported under: its bundle's picture in a layout, at the exact field's rest.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `d3-force-3d` - `SimulationNodeDatum`, `forceSimulation`
- `node:perf_hooks` - `performance`
- [`layout-presets.applyLayoutSettings`](../../packages/explorer/src/client/layout-presets.ts.mdmd.md#symbol-applylayoutsettings)
- [`compressed-url-state.decompressSnapshot`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-decompresssnapshot)
- [`local-storage.getDefaultFilters`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-getdefaultfilters)
- [`local-storage.getDefaultTuning`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-getdefaulttuning)
- [`types.ForceGraphTuning`](../../packages/explorer/src/client/types.ts.mdmd.md#symbol-forcegraphtuning) (type-only)
- [`types.SpatialLayout`](../../packages/explorer/src/client/types.ts.mdmd.md#symbol-spatiallayout) (type-only)
- [`forceGraphData.SpatialGraphNode`](../../packages/explorer/src/client/views/forceGraphData.ts.mdmd.md#symbol-spatialgraphnode)
- [`forceGraphData.spatialGraphOf`](../../packages/explorer/src/client/views/forceGraphData.ts.mdmd.md#symbol-spatialgraphof)
- [`forceGraphLayout.SpatialLink`](../../packages/explorer/src/client/views/forceGraphLayout.ts.mdmd.md#symbol-spatiallink)
- [`forceGraphLayout.easeSpatialLayout`](../../packages/explorer/src/client/views/forceGraphLayout.ts.mdmd.md#symbol-easespatiallayout)
- [`forceGraphLayout.spatialFieldOf`](../../packages/explorer/src/client/views/forceGraphLayout.ts.mdmd.md#symbol-spatialfieldof)
- [`forceGraphPhysics.SpatialField`](../../packages/explorer/src/client/views/forceGraphPhysics.ts.mdmd.md#symbol-spatialfield)
- [`forceGraphPhysics.diagonalOf`](../../packages/explorer/src/client/views/forceGraphPhysics.ts.mdmd.md#symbol-diagonalof)
- [`graph.explorerGraphOf`](../../packages/explorer/src/shared/graph.ts.mdmd.md#symbol-explorergraphof)
- [`StaticExplorerData`](../../packages/explorer/src/shared/staticExplorerData.ts.mdmd.md#symbol-staticexplorerdata) (type-only)
- [`types.ExplorerGraphPayload`](../../packages/explorer/src/shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`evaluate.includeNode`](./evaluate.ts.mdmd.md#symbol-includenode)
- [`evaluate.scopePins`](./evaluate.ts.mdmd.md#symbol-scopepins)
- [`scopes.ScopeRun`](./scopes.ts.mdmd.md#symbol-scoperun)
- [`scopes.retainedSubject`](./scopes.ts.mdmd.md#symbol-retainedsubject)
- [`spatial.spatialReport`](./spatial.ts.mdmd.md#symbol-spatialreport)
<!-- LIVE-DOC:END Dependencies -->
