# scripts/layout-lab/spatial.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/layout-lab/spatial.ts
- Generated At: 2026-10-13T19:38:17.610Z

## Authored
### Purpose
Produces the headless 3D Local Map report from the same filtered graph, documented counts and force configuration used in the browser.

### Notes
A named scope defines retained attention while the full filtered graph supplies forces. Explicit retained files survive test/asset filtering, optional documentation overlays use the shared projection, and missing retained IDs fail explicitly. The report carries settings, counts, radii, positions, preferred and actual pair distances, bounds and sphere overlaps; it is a deterministic tick-based run rather than a claim to reproduce a time-limited live camera session.

Created for [the October 13 shared-preset implementation](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-6--shared-presets-and-advanced-tuning-approved-for-implementation).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `spatialReport` {#symbol-spatialreport}
- Type: function
- Source: [source](../../../../scripts/layout-lab/spatial.ts#L12)
- Parameters: `graph`: [`ExplorerGraphPayload`](../../packages/explorer/src/shared/types.ts.mdmd.md#symbol-explorergraphpayload); `run`: [`ScopeRun`](./scopes.ts.mdmd.md#symbol-scoperun); `tuning`: [`ForceGraphTuning`](../../packages/explorer/src/client/types.ts.mdmd.md#symbol-forcegraphtuning)

##### `spatialReport` — Summary
Run the same full filtered graph the 3D view simulates; the retained neighborhood is attention, not hidden physics.

#### `renderSpatialReport` {#symbol-renderspatialreport}
- Type: function
- Source: [source](../../../../scripts/layout-lab/spatial.ts#L43)

##### `renderSpatialReport` — Summary
Human-readable companion to the complete node, reference-count and coordinate JSON.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.ExplorerFilters`](../../packages/explorer/src/client/types.ts.mdmd.md#symbol-explorerfilters) (type-only)
- [`types.ForceGraphTuning`](../../packages/explorer/src/client/types.ts.mdmd.md#symbol-forcegraphtuning) (type-only)
- [`forceGraphData.spatialGraphOf`](../../packages/explorer/src/client/views/forceGraphData.ts.mdmd.md#symbol-spatialgraphof)
- [`forceGraphLayout.simulateSpatialLayout`](../../packages/explorer/src/client/views/forceGraphLayout.ts.mdmd.md#symbol-simulatespatiallayout)
- [`forceGraphLayout.spatialLinkDistance`](../../packages/explorer/src/client/views/forceGraphLayout.ts.mdmd.md#symbol-spatiallinkdistance)
- [`forceGraphLayout.spatialNodeRadius`](../../packages/explorer/src/client/views/forceGraphLayout.ts.mdmd.md#symbol-spatialnoderadius)
- [`pin-state.getVisibleConnections`](../../packages/explorer/src/client/views/pin-state.ts.mdmd.md#symbol-getvisibleconnections)
- [`staticExplorerData.RelatedDocLink`](../../packages/explorer/src/shared/staticExplorerData.ts.mdmd.md#symbol-relateddoclink) (type-only)
- [`types.ExplorerGraphPayload`](../../packages/explorer/src/shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`evaluate.includeNode`](./evaluate.ts.mdmd.md#symbol-includenode)
- [`evaluate.scopePins`](./evaluate.ts.mdmd.md#symbol-scopepins)
- [`scopes.ScopeRun`](./scopes.ts.mdmd.md#symbol-scoperun)
- [`scopes.retainedSubject`](./scopes.ts.mdmd.md#symbol-retainedsubject)
<!-- LIVE-DOC:END Dependencies -->
