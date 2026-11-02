# scripts/layout-lab/spatial.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/layout-lab/spatial.ts
- Generated At: 2026-11-02T06:07:20.361Z

## Authored
### Purpose
Produces the headless 3D Local Map report from the same filtered graph, documented counts and force configuration used in the browser, in either of its layouts.

### Notes
A named scope's retained files and the subject are what is asked about, and the report's picture is the tuning's hops of connections around them, as on the page since 2026-10-31 (discovery); until then the full filtered graph supplied the forces and the retained neighbourhood only the attention. The physics measures (`approximation.ts`, `drift.ts`) ask for the whole filtered picture instead, every file asked about, since their errors want many spheres. Explicit retained files survive test/asset filtering, optional documentation overlays use the shared projection, and missing retained IDs fail explicitly. The report carries settings, counts, radii, positions, preferred and actual pair distances, bounds and sphere overlaps; it is a deterministic tick-based run rather than a claim to reproduce a time-limited live camera session. The layout (2026-10-14) is the command's `--layout`; the report says of every link whether it pulls in that layout, and in the structure layout hubs have the page's uniform junction size. The November 2 parity correction starts hops at the pins themselves, not their already-retained neighborhood, and whole-root reports reveal files as directory members rather than direct pins.

Created for [the October 13 shared-preset implementation](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-6--shared-presets-and-advanced-tuning-approved-for-implementation).

Since 2026-10-21 the report eases the picture with the page's motion until still, or the most ticks it is given, and says which: `ticks` is the count it took and `still` whether it came to rest ([Turn 5](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-21.1.record.md#turn-5)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `spatialReport` {#symbol-spatialreport}
- Type: function
- Source: [source](../../../../scripts/layout-lab/spatial.ts#L16)
- Parameters: `graph`: [`ExplorerGraphPayload`](../../packages/explorer/src/shared/types.ts.mdmd.md#symbol-explorergraphpayload); `run`: [`ScopeRun`](./scopes.ts.mdmd.md#symbol-scoperun); `tuning`: [`ForceGraphTuning`](../../packages/explorer/src/client/types.ts.mdmd.md#symbol-forcegraphtuning); `layout`: [`SpatialLayout`](../../packages/explorer/src/client/types.ts.mdmd.md#symbol-spatiallayout)

##### `spatialReport` — Summary
Ease the picture the 3D view shows, in either layout, until still or `maxTicks`: since 2026-10-31 the retained files
and the subject are what was asked about, and the picture is the tuning's hops of connections around them, as on the
page; before, the full filtered graph supplied the forces and the retained neighbourhood only the attention.

#### `renderSpatialReport` {#symbol-renderspatialreport}
- Type: function
- Source: [source](../../../../scripts/layout-lab/spatial.ts#L65)

##### `renderSpatialReport` — Summary
Human-readable companion to the complete node, reference-count and coordinate JSON.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.ExplorerFilters`](../../packages/explorer/src/client/types.ts.mdmd.md#symbol-explorerfilters) (type-only)
- [`types.ForceGraphTuning`](../../packages/explorer/src/client/types.ts.mdmd.md#symbol-forcegraphtuning) (type-only)
- [`types.SpatialLayout`](../../packages/explorer/src/client/types.ts.mdmd.md#symbol-spatiallayout) (type-only)
- [`forceGraphData.spatialGraphOf`](../../packages/explorer/src/client/views/forceGraphData.ts.mdmd.md#symbol-spatialgraphof)
- [`forceGraphLayout.easeSpatialLayout`](../../packages/explorer/src/client/views/forceGraphLayout.ts.mdmd.md#symbol-easespatiallayout)
- [`forceGraphLayout.linkPulls`](../../packages/explorer/src/client/views/forceGraphLayout.ts.mdmd.md#symbol-linkpulls)
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

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/change-over-time.mdmd.md`](../../../layer-3/change-over-time.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
