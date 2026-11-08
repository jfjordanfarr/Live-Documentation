# tests/e2e/force-graph-focus.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/force-graph-focus.spec.ts
- Generated At: 2026-11-02T18:46:08.278Z

## Authored
### Purpose
Exercises file focus and independent inspection in the rendered Force Graph through URLs, search, node clicks, filtering, resizing and return from Local Map. Guards context-menu focus restoration and the separation of node dragging from held actions.

### Notes

- The first test clicks the focused sphere at a point no nearer sphere covers, read from the rendered scene (2026-10-15, [Turn 10](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-14.1.record.md#turn-10)): it had clicked the canvas centre, where `pathfind.ts`, a bigger neighbour, came to stand in front of `graph.ts` once the graph gained its files, and the panel's text check passed because `pathfind.ts`'s doc names `graph.ts`. The portable inspection target now proves the sphere's identity while the pin set stays empty; the reader's explicit Centre action exercises navigation.
- The search case goes through the search bar since 2026-10-14: Ctrl+P focuses its field, and the file chosen is pinned and focused, with no details panel opened. Manual-pan restoration is measured once the container says the simulation has settled; until 2026-10-16 the test waited out the library's fifteen-second cooldown, which the view no longer runs. A right-button pan must leave the context menu closed. The estate case also exercises reduced motion.
- The keyboard context journey moves the pointer away before opening More, lets focusout and hover-exit callbacks run, then checks that Escape restores focus to a visible control. The drag journey measures an actual change in the sphere's world position, waits beyond the hold threshold before release, and requires no menu, inspection or pin change. These cover failures exercised during the [October 20 continuation](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md#turn-2), rather than treating a pointer event alone as evidence that dragging happened.
- Real Tab navigation establishes keyboard attention while the pointer is on empty canvas or outside the view; a temporary peek at another sphere must return to that keyboard target. Moving focus elsewhere restores the retained scope even when the original hover-exit grace already expired.
- A separate journey begins in 2D with a neighbour pinned, switches to 3D, then releases that neighbour through the mouse-operated Unpin control. Moving onto empty canvas must restore every sphere's brightness while the mouse-focused button remains reachable. A subsequent Tab intentionally previews the same file without repinning it, and moving focus out of both controls and spatial names restores the full graph again. A name is itself a deliberate keyboard preview target.
- The switch's cost (2026-11-07): on the first case's picture, this repository's 3D map focused on `graph.ts`, a press of 2D and then of 3D are each timed in the page from the click until the press's own work is done (its handler and the microtasks it queued, read at the next task), and each must take under half a second beside the 2D map's own render of the picture, which any arrival in 2D pays and which the page measures as `live-docs:switch-render`. Before the fix the presses had blocked the page for about 10 s and 15 s, which had put the first case at its 30 s budget ([the switch-cost probe](../../../../AI-Agent-Workspace/Probes/2026-11-07/switch-cost/README.md)); the case fails on that bundle. A timer every 20 ms from the press's return until the transition's layer goes must never wait a second (its longest about 0.2 to 0.3 s on the fixed bundle, a frame of the 3D picture's software renderer), so that the copying the switch now does in slices cannot grow back into one long task unseen. The same case watches each transition every frame until its layer goes, and requires that it still carry the focus's travelling name, draw the directory membranes and draw the cards folding, the transition the owner accepted on October 2. Since 2026-11-08 the case also notes the transition's start on the clock, when its layer is appended, and requires its first frame to follow within 400 ms: before the fix it came 4.6 s late on the way to 2D, and after it 83 to 179 ms on this machine.
- A stationary pointer must lose a sphere that camera zoom carries away; a touch held long enough to produce an actual pointer target must release that target on lift while keeping its explicit inspection. These hold the application-owned picker's lifecycle independently of the library's tooltip cache.
- Hit testing includes dim spheres, which remain interactive. Empty points are checked with projected screen radii, the actual DOM canvas, the application pointer target, so neither world-space measurements nor a covering control can masquerade as empty canvas.
- Full-repository navigation waits for actual stillness with a one-minute allowance. The [October 24 measurements](../../../../AI-Agent-Workspace/Probes/2026-10-24/connections-tuning/performance-findings.md) found 31–33 seconds at the selected sphere detail, and over 25 seconds even at the old detail. These are functional journeys, not performance benchmarks; their camera, picking and attention assertions remain independent of that setup allowance.

Since 2026-10-31 (discovery, [Turn 4 of the October 31 record](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-31.1.record.md#turn-4)) the frontier's spheres stand at .3 of their alpha by the picture's own rule, so the checks tell that dimming from the hover's fade (.15): a sphere faded by the hover reads under .25, and the hoverable candidates are the frontier's. Clearing the pins releases the subject too, so the picture becomes the layout's start, the archipelago of every group's seed since 2026-11-02, which the last check computes with the shared scope over every file, since a retain link's old grammar shows tests and assets both. The hover check re-enters its sphere at a point where it is hittable, since in the smaller picture a nearer sphere can cover another's centre, and its budget is 180 seconds for the two settles it waits through.

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
- [`forceGraphScope.spatialScope`](../../packages/explorer/src/client/views/forceGraphScope.ts.mdmd.md#symbol-spatialscope-function)
- [`forceGraphScope.startHops`](../../packages/explorer/src/client/views/forceGraphScope.ts.mdmd.md#symbol-starthops)
- [`forceGraphScope.startOf`](../../packages/explorer/src/client/views/forceGraphScope.ts.mdmd.md#symbol-startof)
- [`graph.explorerGraphOf`](../../packages/explorer/src/shared/graph.ts.mdmd.md#symbol-explorergraphof)
- [`StaticExplorerData`](../../packages/explorer/src/shared/staticExplorerData.ts.mdmd.md#symbol-staticexplorerdata) (type-only)
- [`force-graph-observation.observeGraph`](./force-graph-observation.ts.mdmd.md#symbol-observegraph)
- [`force-graph-observation.renderedNodes`](./force-graph-observation.ts.mdmd.md#symbol-renderednodes)
- [`search-bar.currentSnapshot`](./search-bar.ts.mdmd.md#symbol-currentsnapshot)
- [`still-picture.localRetainUrl`](./still-picture.ts.mdmd.md#symbol-localretainurl)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
