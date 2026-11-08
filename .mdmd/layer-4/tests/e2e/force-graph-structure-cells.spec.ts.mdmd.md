# tests/e2e/force-graph-structure-cells.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/force-graph-structure-cells.spec.ts
- Generated At: 2026-11-07T23:45:53.149Z

## Authored
### Purpose
Checks in the browser the bag of cells of the 3D Local Map's Structure layout: with Skin chosen and one hop, the start is the scan root's own files and one bubble for each top-level directory, each holding as many files as its directory holds, never dimmed and wearing no ring, and a top-level directory of one file stands as that file; a click on the `packages` bubble opens the directory in the shared opened set (the address's, the 2D's) without pinning anything, its hub stands open, and every file and subdirectory bubble its skin showed stands, at the frame of the pop, where the skin showed it, inside the skin, a bubble at its size; releasing the directory from the pin tray wraps it again; and Off draws every hub of two hops as a hub, Skin then wraps those at the frontier, and Off again unwraps them.

### Notes
Written on 2026-11-07 with the feature, at the owner's "can we also get the bag-of-cells look for the "structure" part too?" ([Turn 8 of the November 6 record](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-06.1.record.md#turn-8)) and, the same day, "Make no embryos which appear to have only one cell". The bubbles expected are computed from the bundle by `structureCells`, the function the page runs, over the scope `spatialScope` gives the root and the opened directories; the bubbles drawn are read from the page's node buffers and the wrappers' record. The frame of the pop is the page's own, its clock paused at the click and stepped one frame, as the shells' spec does. Every case fails on the bundle before the feature, which drew no bubble in the Structure layout; that Off is byte for byte the picture it was is shown by the pictures in [the evidence](../../../../AI-Agent-Workspace/Screenshots/2026-11-07/structure-cells/README.md), not by a case that could not fail there.

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
- [`local-storage.PERSISTED_UI_KEY`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-persisted_ui_key)
- [`local-storage.PERSISTED_UI_VERSION`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-persisted_ui_version)
- [`local-storage.getDefaultTuning`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-getdefaulttuning)
- [`types.GroupWrappers`](../../packages/explorer/src/client/types.ts.mdmd.md#symbol-groupwrappers) (type-only)
- [`forceGraphData.directoryNodeId`](../../packages/explorer/src/client/views/forceGraphData.ts.mdmd.md#symbol-directorynodeid)
- [`forceGraphData.spatialGraphOf`](../../packages/explorer/src/client/views/forceGraphData.ts.mdmd.md#symbol-spatialgraphof)
- [`forceGraphLayout.linkPulls`](../../packages/explorer/src/client/views/forceGraphLayout.ts.mdmd.md#symbol-linkpulls)
- [`forceGraphScope.spatialScope`](../../packages/explorer/src/client/views/forceGraphScope.ts.mdmd.md#symbol-spatialscope-function)
- [`forceGraphShells.structureCells`](../../packages/explorer/src/client/views/forceGraphShells.ts.mdmd.md#symbol-structurecells)
- [`force-graph-observation.observeGraph`](./force-graph-observation.ts.mdmd.md#symbol-observegraph)
- [`force-graph-observation.renderedNodes`](./force-graph-observation.ts.mdmd.md#symbol-renderednodes)
- [`still-picture.loadGraph`](./still-picture.ts.mdmd.md#symbol-loadgraph)
<!-- LIVE-DOC:END Dependencies -->
