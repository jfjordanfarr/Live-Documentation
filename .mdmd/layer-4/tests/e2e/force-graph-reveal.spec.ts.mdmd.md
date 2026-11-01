# tests/e2e/force-graph-reveal.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/force-graph-reveal.spec.ts
- Generated At: 2026-10-31T22:13:32.272Z

## Authored
### Purpose
Shows in the browser that the 3D picture enters from what was asked about alone, a share of the whole a frame so that the whole is in within the tuning's Reveal Frames, and comes to rest only when every file is in, and that a membership change keeps what is shown and brings the newcomers in the same way.

### Notes
Written on 2026-10-28 after the reveal was looked at ([the day's pictures](../../../../AI-Agent-Workspace/Screenshots/2026-10-28/README.md)). The sizes are read as each frame is drawn, through `renderedPieces` of the observation instrument, because at this size a tick is faster than a poll from outside the page: the first attempt polled and missed pieces. The spec found two faults in the view's first reveal, a piece skipped because the library applies a request one task later and a second request before then replaces the first, and the first piece never drawn because the library draws an applied piece a frame later still; the view now waits for a piece to be applied and on screen before asking for the next ([the Turn 4 work notes](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-28.1.record.md#turn-4-work-notes)). Rewritten on 2026-10-31 with discovery: the first piece is the subject alone and the pace a share of the whole a frame, the tuning's `revealFrames`, in place of the first 300 spheres and a tenth more a frame ([Turn 4 of the October 31 record](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-31.1.record.md#turn-4)).

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
- [`forceGraphData.spatialGraphOf`](../../packages/explorer/src/client/views/forceGraphData.ts.mdmd.md#symbol-spatialgraphof)
- [`forceGraphLayout.linkPulls`](../../packages/explorer/src/client/views/forceGraphLayout.ts.mdmd.md#symbol-linkpulls)
- [`forceGraphReveal.nextRevealCount`](../../packages/explorer/src/client/views/forceGraphReveal.ts.mdmd.md#symbol-nextrevealcount)
- [`forceGraphScope.spatialScope`](../../packages/explorer/src/client/views/forceGraphScope.ts.mdmd.md#symbol-spatialscope-function)
- [`force-graph-observation.engineActivity`](./force-graph-observation.ts.mdmd.md#symbol-engineactivity)
- [`force-graph-observation.observeGraph`](./force-graph-observation.ts.mdmd.md#symbol-observegraph)
- [`force-graph-observation.renderedNodes`](./force-graph-observation.ts.mdmd.md#symbol-renderednodes)
- [`force-graph-observation.renderedPieces`](./force-graph-observation.ts.mdmd.md#symbol-renderedpieces)
- [`still-picture.loadGraph`](./still-picture.ts.mdmd.md#symbol-loadgraph)
<!-- LIVE-DOC:END Dependencies -->
