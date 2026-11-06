# tests/e2e/force-graph-shells.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/force-graph-shells.spec.ts
- Generated At: 2026-11-06T02:11:52.119Z

## Authored
### Purpose
Checks in the browser that the directory shells stay off by default, that Skin draws this repository's pinned picture's shells two directories deep with as many bundled wires as the pure rules compute, and that a click on the estate's portal shell pops it into its files and its subdirectories' shells and its directory's name wraps it again.

### Notes
Written on 2026-11-05 with the experiment ([the design](../../../../.mdmd/layer-3/live-documentation-explorer.mdmd.md#competing-layout-preferences)). The shells drawn are read from the page's node and wire buffers and the wrappers' mesh record; the shells expected are computed from the bundle by `shellPicture`, the function the page runs. The pop is aimed where the pointer names the shell, its centre or a point within its body, since a sphere may stand in front; wrapping again uses the keyboard on the popped directory's name, which follows its files while they settle for some 15 s.

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
- [`forceGraphLayout.shellRadius`](../../packages/explorer/src/client/views/forceGraphLayout.ts.mdmd.md#symbol-shellradius)
- [`forceGraphScope.connectedNeighbours`](../../packages/explorer/src/client/views/forceGraphScope.ts.mdmd.md#symbol-connectedneighbours)
- [`forceGraphScope.spatialScope`](../../packages/explorer/src/client/views/forceGraphScope.ts.mdmd.md#symbol-spatialscope-function)
- [`forceGraphShells.ShellPicture`](../../packages/explorer/src/client/views/forceGraphShells.ts.mdmd.md#symbol-shellpicture-interface)
- [`forceGraphShells.shellPicture`](../../packages/explorer/src/client/views/forceGraphShells.ts.mdmd.md#symbol-shellpicture-function)
- [`force-graph-observation.observeGraph`](./force-graph-observation.ts.mdmd.md#symbol-observegraph)
- [`still-picture.loadGraph`](./still-picture.ts.mdmd.md#symbol-loadgraph)
<!-- LIVE-DOC:END Dependencies -->
