# tests/e2e/force-graph-building.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/force-graph-building.spec.ts
- Generated At: 2026-11-15T23:39:00.753Z

## Authored
### Purpose
Browser cases for the 3D Local Map while it builds, on this repository's archipelago, clicking the largest group's seed. With the pointer kept still, nothing hovers or fades while the map builds or after it, the map shows its sign and waiting cursor, and the pointer's first move hovers. A press on a sphere or on the pinned seed's name while the map builds does nothing, and nothing is replayed once it has built. A drag that starts on a sphere turns the camera. Under reduced motion the sign stands still.

### Notes
- Written on November 15, 2026, for the owner's decision ([Turn 4 of that day's record](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-15.1.record.md#turn-4)); the journey is the original finding's, a click on a seed with the pointer kept still.
- The build is made long enough to act inside by settings that exist, two hops and Reveal Frames at its most (240), so that the second hop enters a sphere or two a frame; wrappers are off so the software renderer draws it quickly enough. There is no test-only hook.
- A sphere faded by a hover is drawn at a fifth of its strength (0.15 for a full one), below the frontier's 0.3, which is how a fade is read from the drawn opacities.

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
- [`compressed-url-state.decompressSnapshot`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-decompresssnapshot)
- [`forceGraphData.spatialGraphOf`](../../packages/explorer/src/client/views/forceGraphData.ts.mdmd.md#symbol-spatialgraphof)
- [`forceGraphLayout.linkPulls`](../../packages/explorer/src/client/views/forceGraphLayout.ts.mdmd.md#symbol-linkpulls)
- [`forceGraphScope.spatialScope`](../../packages/explorer/src/client/views/forceGraphScope.ts.mdmd.md#symbol-spatialscope-function)
- [`forceGraphScope.startHops`](../../packages/explorer/src/client/views/forceGraphScope.ts.mdmd.md#symbol-starthops)
- [`forceGraphScope.startOf`](../../packages/explorer/src/client/views/forceGraphScope.ts.mdmd.md#symbol-startof)
- [`force-graph-observation.observeGraph`](./force-graph-observation.ts.mdmd.md#symbol-observegraph)
- [`force-graph-observation.renderedNodes`](./force-graph-observation.ts.mdmd.md#symbol-renderednodes)
- [`still-picture.loadGraph`](./still-picture.ts.mdmd.md#symbol-loadgraph)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
