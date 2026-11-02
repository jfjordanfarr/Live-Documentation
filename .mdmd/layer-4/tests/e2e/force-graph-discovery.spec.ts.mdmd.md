# tests/e2e/force-graph-discovery.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/force-graph-discovery.spec.ts
- Generated At: 2026-11-02T17:03:48.352Z

## Authored
### Purpose
Shows in the browser that the 3D Local Map under discovery holds exactly what the shared scope says: the start's hops with nothing asked about, in both layouts; a pin's hops; the hops lever; the growth from an inspected frontier file and its receding; and a directory opened whole, with the sidebar's count and the key's row.

### Notes
Written on 2026-10-31 with the discovery pass ([Turns 4 to 8 of the October 31 record](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-31.1.record.md#turn-4)). The expected picture is computed from the bundle by the same pure `spatialScope` and `startOf` the page uses, over the graph the page projects, so that each test says which spheres must be on screen and at what alpha (full spheres at .75, the frontier at .3, the batches' base alpha times the view's), not merely that some are; the frames and counts are read from the rendered scene through the observation instrument. The inspected file's growth is driven by the address, which carries the inspection, and its receding by the reader's Close, since a click on a sphere is held by `inspection.spec.ts` already.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page`, `expect`, `test`
- [`compressed-url-state.DEFAULT_SNAPSHOT`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-default_snapshot)
- [`compressed-url-state.compressSnapshot`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-compresssnapshot)
- [`local-storage.getDefaultTuning`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-getdefaulttuning)
- [`types.SpatialLayout`](../../packages/explorer/src/client/types.ts.mdmd.md#symbol-spatiallayout) (type-only)
- [`forceGraphData.spatialGraphOf`](../../packages/explorer/src/client/views/forceGraphData.ts.mdmd.md#symbol-spatialgraphof)
- [`forceGraphLayout.linkPulls`](../../packages/explorer/src/client/views/forceGraphLayout.ts.mdmd.md#symbol-linkpulls)
- [`forceGraphScope.spatialScope`](../../packages/explorer/src/client/views/forceGraphScope.ts.mdmd.md#symbol-spatialscope-function)
- [`forceGraphScope.startHops`](../../packages/explorer/src/client/views/forceGraphScope.ts.mdmd.md#symbol-starthops)
- [`forceGraphScope.startOf`](../../packages/explorer/src/client/views/forceGraphScope.ts.mdmd.md#symbol-startof)
- [`force-graph-observation.observeGraph`](./force-graph-observation.ts.mdmd.md#symbol-observegraph)
- [`force-graph-observation.renderedLinks`](./force-graph-observation.ts.mdmd.md#symbol-renderedlinks)
- [`force-graph-observation.renderedNodes`](./force-graph-observation.ts.mdmd.md#symbol-renderednodes)
- [`still-picture.loadGraph`](./still-picture.ts.mdmd.md#symbol-loadgraph)
<!-- LIVE-DOC:END Dependencies -->
