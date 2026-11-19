# `tests/e2e/force-graph-reveal.spec.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/e2e/force-graph-reveal.spec.ts`
- Generated At: 2026-11-19T21:10:21.228Z

## Authored
### Purpose
Shows in the browser that the 3D picture enters from what was asked about alone, a share of the whole a frame so that the whole is in within the tuning's Reveal Frames, and comes to rest only when every file is in, and that a membership change keeps what is shown and brings the newcomers in the same way.

### Notes
Written on 2026-10-28 after the reveal was looked at ([the day's pictures](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-28/Screenshots/README.md)). The sizes are read as each frame is drawn, through `renderedPieces` of the observation instrument, because at this size a tick is faster than a poll from outside the page: the first attempt polled and missed pieces. The spec found two faults in the view's first reveal, a piece skipped because the library applies a request one task later and a second request before then replaces the first, and the first piece never drawn because the library draws an applied piece a frame later still; the view now waits for a piece to be applied and on screen before asking for the next ([the Turn 4 work notes](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-28/2026-10-28.1.record.md#turn-4-work-notes)). Rewritten on 2026-10-31 with discovery: the first piece is the subject alone and the pace a share of the whole a frame, the tuning's `revealFrames`, in place of the first 300 spheres and a tenth more a frame ([Turn 4 of the October 31 record](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-31/2026-10-31.1.record.md#turn-4)). Since 2026-11-02 the membership-change case is measured around a subject: a start's new seeds are what the start asks about and enter at once, so a change of the start alone shows no pace; the picture before and after is computed by the shared scope, since the tests shown can move a group's seed, and the pace is expected from what is kept ([Turn 3 of the November 2 record](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-02/2026-11-02.1.record.md#turn-3).

Since November 8, 2026, the entry explicitly carries Off and two hops. Its promise is the bare-file reveal wave after the initial first-hop piece; one hop would remove that second wave, and Skin adds bodies beyond this scope oracle. Fresh defaults are exercised separately.

**Two bounds on coming to rest in the membership case, since 2026-11-17** ([the third run of the gate, November 16 record](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-16/2026-11-16.1.record.md#the-third-run-of-the-gate)). The case waited 90 s for each of its two settles and stopped there when a settle was slower, its picture unread. Its two settles now wait through `cameToRest` in [the observation instrument](force-graph-observation.ts.mdmd.md), as the archipelago case of [the discovery spec](force-graph-discovery.spec.ts.mdmd.md) does: the bound in drawn frames is hard, and the clock, 90 s a settle and 150 s for the case as they stood, is soft, so that a slow settle still ends the case red after the pieces, the kept spheres and the engine's one run have been checked. What prompted it: the colour table's `palette.ts`, a new file that some twenty files of the client import, stands one hop from this case's subject, `forceGraphView.ts`. Measured that day, each alone on a quiet machine: on the build before it the subject's picture with tests shown is 273 files and the second settle took 421 frames and 51.6 s (8.2 frames a second); with it, 276 files, 1,228 frames and 112.7 s (10.9 frames a second). Three more files, one of them imported widely, and three times the frames to rest at no lower a frame rate: the cost is the physics', not the drawing's. The first settle took 253 frames before and 331 with it. The bounds are 700 and 2,500 frames, twice the most measured. The case ends red by its clock alone on this machine until the settle is shorter. Since 2026-11-19 the bounds count substeps of the motion, at the same numbers, as `cameToRest` explains in [the observation instrument](force-graph-observation.ts.mdmd.md); the frames in the measurements above were substeps then.

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
- [`force-graph-observation.cameToRest`](./force-graph-observation.ts.mdmd.md#symbol-cametorest)
- [`force-graph-observation.caseClock`](./force-graph-observation.ts.mdmd.md#symbol-caseclock)
- [`force-graph-observation.engineActivity`](./force-graph-observation.ts.mdmd.md#symbol-engineactivity)
- [`force-graph-observation.observeGraph`](./force-graph-observation.ts.mdmd.md#symbol-observegraph)
- [`force-graph-observation.renderedNodes`](./force-graph-observation.ts.mdmd.md#symbol-renderednodes)
- [`force-graph-observation.renderedPieces`](./force-graph-observation.ts.mdmd.md#symbol-renderedpieces)
- [`still-picture.loadGraph`](./still-picture.ts.mdmd.md#symbol-loadgraph)
<!-- LIVE-DOC:END Dependencies -->
