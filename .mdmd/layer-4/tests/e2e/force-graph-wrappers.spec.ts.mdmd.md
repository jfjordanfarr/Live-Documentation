# tests/e2e/force-graph-wrappers.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/force-graph-wrappers.spec.ts
- Generated At: 2026-11-05T23:08:55.514Z

## Authored
### Purpose
Checks in the browser that Group Wrappers stays off by default and, chosen as Skin, wraps every group of two files or more at this repository's archipelago, names the group on hover, pops it open into its files on a click that pins its seed, and wraps it again when the pin is released.

### Notes
Written on 2026-11-05 with the experiment ([the design](../../../../.mdmd/layer-3/live-documentation-explorer.mdmd.md#competing-layout-preferences)). The wrappers are read from the record the wrappers' mesh keeps of what it drew (`userData.spatialWrappers`), and the groups expected are computed from the bundle by the same pure scope the page uses, so the count follows the repository; the research of November 5 counted 42 groups of two files or more among 95. The choice is seeded as a saved Tuning choice, which also exercises its persistence. The journey case waits for the picture to settle before hovering, since the camera follows the first unfold; the archipelago with wrappers settled in about sixteen seconds on this machine's software renderer, against under two without, because each wrapped seed keeps its wrapper's room. Motion stays off in the suite: the burst runs only on a pop and its end is awaited, not measured.

Since 2026-11-05 the pinned group holds its hidden files in directory shells, which the check of the other groups' wrappers leaves aside, and the release focuses whichever of the seed's names is shown, since beside the shells the subject's focus name and its name label need not both be placed.

Since the second round of 2026-11-06 a case counts the spheres within each wrapped group's skin, its seed among them, against the group's size, each within the skin ([the evidence](../../../../AI-Agent-Workspace/Screenshots/2026-11-06/shell-leaves/README.md)).

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
- [`local-storage.PERSISTED_UI_KEY`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-persisted_ui_key)
- [`local-storage.PERSISTED_UI_VERSION`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-persisted_ui_version)
- [`local-storage.getDefaultTuning`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-getdefaulttuning)
- [`types.GroupWrappers`](../../packages/explorer/src/client/types.ts.mdmd.md#symbol-groupwrappers) (type-only)
- [`forceGraphData.spatialGraphOf`](../../packages/explorer/src/client/views/forceGraphData.ts.mdmd.md#symbol-spatialgraphof)
- [`forceGraphLayout.linkPulls`](../../packages/explorer/src/client/views/forceGraphLayout.ts.mdmd.md#symbol-linkpulls)
- [`forceGraphScope.spatialScope`](../../packages/explorer/src/client/views/forceGraphScope.ts.mdmd.md#symbol-spatialscope-function)
- [`forceGraphScope.startHops`](../../packages/explorer/src/client/views/forceGraphScope.ts.mdmd.md#symbol-starthops)
- [`forceGraphScope.startOf`](../../packages/explorer/src/client/views/forceGraphScope.ts.mdmd.md#symbol-startof)
- [`forceGraphWrappers.wrappedSeeds`](../../packages/explorer/src/client/views/forceGraphWrappers.ts.mdmd.md#symbol-wrappedseeds)
- [`force-graph-observation.observeGraph`](./force-graph-observation.ts.mdmd.md#symbol-observegraph)
- [`force-graph-observation.renderedNodes`](./force-graph-observation.ts.mdmd.md#symbol-renderednodes)
- [`still-picture.loadGraph`](./still-picture.ts.mdmd.md#symbol-loadgraph)
<!-- LIVE-DOC:END Dependencies -->
