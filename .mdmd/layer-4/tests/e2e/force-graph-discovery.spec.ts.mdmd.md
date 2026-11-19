# `tests/e2e/force-graph-discovery.spec.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/e2e/force-graph-discovery.spec.ts`
- Generated At: 2026-11-19T21:10:20.963Z

## Authored
### Purpose
Shows in the browser that the 3D Local Map under discovery holds exactly what the shared scope says: the start's hops with nothing asked about, in both layouts; a pin's hops; the hops lever; the growth from an inspected frontier file and its receding; and a directory opened whole, with the sidebar's count and the key's row.

### Notes
Written on 2026-10-31 with the discovery pass ([Turns 4 to 8 of the October 31 record](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-31/2026-10-31.1.record.md#turn-4)). The expected picture is computed from the bundle by the same pure `spatialScope` and `startOf` the page uses, over the graph the page projects, so that each test says which spheres must be on screen and at what alpha (full spheres at .75, the frontier at .3, the batches' base alpha times the view's), not merely that some are; the frames and counts are read from the rendered scene through the observation instrument. The inspected file's growth is driven by the address, which carries the inspection, and its receding by the reader's Close, since a click on a sphere is held by `inspection.spec.ts` already.

Since November 8, 2026, these bare-file scope and ring checks explicitly carry Off and two hops in their shared state. This preserves the exact spheres, frontier alpha and ring promises while fresh arrivals adopt Skin and one hop. The narrowing journey carries its one-hop override in the same shared state.

**Two bounds on coming to rest in the archipelago case, since 2026-11-13.** The case's two settles, the archipelago's entry and the largest group's growth from its seed, wait through `cameToRest` in [the observation instrument](force-graph-observation.ts.mdmd.md) under two bounds, as in [the update spec's motion case](force-graph-update.spec.ts.mdmd.md). The bound in drawn frames is hard: past it the picture is not coming to rest, whatever the machine. The clock is soft and keeps its figures, 120 s for each settle and 300 s for the case: on a slow machine the case still ends red, by the clock alone, after it has checked the picture at rest. The owner chose that the clock stay red on a slow day: "I personally like that this keeps going red because it literally makes the perf a red-hot sticking point"; "A is a good idea though. I just don't want to see that urgency of bad perf going away" ([Turn 3 of the November 12 record](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-12/2026-11-12.1.record.md#turn-3)). The hard timeout is only a net for a page that stops drawing: both frame bounds at a pessimistic two frames a second, and a minute more (1,560 s). The other cases keep their 120 s waits unchanged.

Measured on 2026-11-13, 15:41 to 15:45 UTC, while a recomputation of the repository's history ran three processes beside it (load average about 15 on twenty hardware threads): the archipelago entered in 44 frames and 3.0 s (14.5 frames a second); the largest group grew and came to rest in 1,319 frames and 139.2 s (9.5 frames a second), past the 120 s clock, and the case went on and held every other expectation, failing by the clock alone, in 146.6 s. Run again as built from 15:47, under a heavier load (about 21), the growth took the same 1,319 frames in 177.7 s (7.4 frames a second), and the case again failed by the clock alone, in 185.9 s. An earlier run that day, with a trial bound of 600 frames on the growth, stopped it still moving after 601 frames and 66.6 s. The bounds are 300 frames for the entry, which costs some twenty seconds at its frame rate, and 2,700 for the growth, twice the most measured, which catches a growth that never rests in about five minutes at nine frames a second. Since 2026-11-19 the bounds count substeps of the motion, at the same numbers, as `cameToRest` explains in [the observation instrument](force-graph-observation.ts.mdmd.md); the frames in the measurements above were substeps then. The growth's whole settle takes about 5,250 substeps on this repository today, so the case is red by its bound until the tail is shortened; the bound is the measure of that fault, not to be raised.

Since 2026-11-16 ([Turn 10 of the November 15 record](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-10)) the key's rows are a sample and at most two words, and the cases here read *Beyond* and *More connected* where they read the rows' sentences: a change of wording and nothing else.

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
- [`types.SpatialLayout`](../../packages/explorer/src/client/types.ts.mdmd.md#symbol-spatiallayout) (type-only)
- [`forceGraphData.spatialGraphOf`](../../packages/explorer/src/client/views/forceGraphData.ts.mdmd.md#symbol-spatialgraphof)
- [`forceGraphLayout.linkPulls`](../../packages/explorer/src/client/views/forceGraphLayout.ts.mdmd.md#symbol-linkpulls)
- [`forceGraphScope.spatialScope`](../../packages/explorer/src/client/views/forceGraphScope.ts.mdmd.md#symbol-spatialscope-function)
- [`forceGraphScope.startHops`](../../packages/explorer/src/client/views/forceGraphScope.ts.mdmd.md#symbol-starthops)
- [`forceGraphScope.startOf`](../../packages/explorer/src/client/views/forceGraphScope.ts.mdmd.md#symbol-startof)
- [`force-graph-observation.cameToRest`](./force-graph-observation.ts.mdmd.md#symbol-cametorest)
- [`force-graph-observation.caseClock`](./force-graph-observation.ts.mdmd.md#symbol-caseclock)
- [`force-graph-observation.observeGraph`](./force-graph-observation.ts.mdmd.md#symbol-observegraph)
- [`force-graph-observation.renderedLinks`](./force-graph-observation.ts.mdmd.md#symbol-renderedlinks)
- [`force-graph-observation.renderedNodes`](./force-graph-observation.ts.mdmd.md#symbol-renderednodes)
- [`still-picture.loadGraph`](./still-picture.ts.mdmd.md#symbol-loadgraph)
<!-- LIVE-DOC:END Dependencies -->
