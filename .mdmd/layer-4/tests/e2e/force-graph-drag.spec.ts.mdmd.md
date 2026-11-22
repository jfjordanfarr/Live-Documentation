# `tests/e2e/force-graph-drag.spec.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/e2e/force-graph-drag.spec.ts`
- Generated At: 2026-11-22T02:24:13.727Z

## Authored
### Purpose
The browser's hold on a drag in the 3D Local Map: on this repository's map with one file pinned, the files tied to a dragged sphere have followed it by the time the hand arrives, the forces run while it is held, and once it is let go the map comes to rest again with the sphere where the hand left it.

### Notes
- Written on November 22, 2026, for the owner's words of that day, as root relayed them to the builder: "I notice that the 3D graph stops simulating rather quickly. It's efficient, which is awesome, but the one place I would want that responsiveness back is when I'm clicking and dragging an item and swinging the graph around with me."
- The cause was in the motion's pacing ([`forceGraphLayout.ts`](../../packages/explorer/src/client/views/forceGraphLayout.ts.mdmd.md), `motionForce`): a hand moves its sphere at every frame, and each such frame was held to one evaluation of the field, as a frame is when a new piece of the picture arrives, so the picture trailed the hand a substep a frame or less. The unit test beside the motion was seen failing first; a second mend lets a frame take several whole ticks while a sphere is held; this case was written with the mends, and before them an instrument measured the same drag on the old build ([the numbers and pictures](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-22/Screenshots/drag-live/README.md)).
- It asserts shares and rest, never a duration: how far each tied file has come when the hand arrives, as a share of the way that file goes in the end, since the tether keeps a tied file from going the hand's whole way. The bound is six tenths at the median; the instrument measured about three tenths over all the picture's spheres on the build before the mend. The case itself was not run on that build: it was written after the unit test had been seen failing and mended, and it passed on the first mend alone in the suite's whole run in its earlier form, half the hand's way.

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
- [`force-graph-observation.observeGraph`](./force-graph-observation.ts.mdmd.md#symbol-observegraph)
- [`force-graph-observation.renderedNodes`](./force-graph-observation.ts.mdmd.md#symbol-renderednodes)
- [`still-picture.loadGraph`](./still-picture.ts.mdmd.md#symbol-loadgraph)
<!-- LIVE-DOC:END Dependencies -->
