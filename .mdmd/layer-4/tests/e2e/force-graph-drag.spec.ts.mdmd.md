# `tests/e2e/force-graph-drag.spec.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/e2e/force-graph-drag.spec.ts`
- Generated At: 2026-11-23T16:13:11.424Z

## Authored
### Purpose
The browser's hold on a drag in the 3D Local Map: on this repository's map with one file pinned, the files tied to a dragged sphere have followed it by the time the hand arrives, the forces run while it is held, and once it is let go the map comes to rest again with the sphere where the hand left it.

### Notes
- Written on November 22, 2026, for the owner's words of that day, as root relayed them to the builder: "I notice that the 3D graph stops simulating rather quickly. It's efficient, which is awesome, but the one place I would want that responsiveness back is when I'm clicking and dragging an item and swinging the graph around with me."
- The cause was in the motion's pacing ([`forceGraphLayout.ts`](../../packages/explorer/src/client/views/forceGraphLayout.ts.mdmd.md), `motionForce`): a hand moves its sphere at every frame, and each such frame was held to one evaluation of the field, as a frame is when a new piece of the picture arrives, so the picture trailed the hand a substep a frame or less. The unit test beside the motion was seen failing first; a second mend lets a frame take several whole ticks while a sphere is held; this case was written with the mends, and before them an instrument measured the same drag on the old build ([the numbers and pictures](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-22/Screenshots/drag-live/README.md)).
- It asserts shares and rest, never a duration: how far each tied file has come when the hand arrives, as a share of the way that file goes in the end, since the tether keeps a tied file from going the hand's whole way. The bound is six tenths at the median; the instrument measured about three tenths over all the picture's spheres on the build before the mend. The case itself was not run on that build: it was written after the unit test had been seen failing and mended, and it passed on the first mend alone in the suite's whole run in its earlier form, half the hand's way.
- From the afternoon of 2026-11-22 it ran under both values of Tuning's Drag, read from the address: holding every sphere toward where it stood, and Swings, where what is tied to the held sphere lets go of where it stood ([the two side by side](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-22/Screenshots/drag-swings/README.md)). Behind a temporary switch that restored the old pacing the case failed at its first assertion: the dragged sphere itself had come 23 units when the forty moves were done.
- Since 2026-11-23 it is one case: the owner chose Swings ("I like \"Swings\" a little bettter"), and every drag swings. The same day's pick rule made the hand take the sphere itself, where the press had taken a directory shell in front of it; measured then, under holding the sphere let go came back to 0.489 of the hand's way, against the case's bound of a half, red in one whole run and passed in the next with nothing in the motion changed, while swinging it kept 0.70 and the tied files had come 1.16 of their final way when the hand arrived ([the measurement](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-23/Probes/landing/README.md)). The case prints its two readings on a `DRAG-READING` line.

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
