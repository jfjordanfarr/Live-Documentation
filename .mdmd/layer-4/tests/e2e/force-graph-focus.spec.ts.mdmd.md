# `tests/e2e/force-graph-focus.spec.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/e2e/force-graph-focus.spec.ts`
- Generated At: 2026-11-19T21:10:21.075Z

## Authored
### Purpose
Exercises file focus and independent inspection in the rendered Force Graph through URLs, search, node clicks, filtering, resizing and return from Local Map. Guards context-menu focus restoration and the separation of node dragging from held actions.

### Notes

- Since November 15, 2026, `uncover` first waits for the map to have built (no `data-building`), since a press while the 3D map builds is dropped and nothing hovers ([Turn 4 of that day's record](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-4)); the first test had clicked the focused sphere during its arrival's build.
- Since November 19, 2026, `uncover` turns the camera from a point of the picture's background (`backgroundPoint`: no drawn sphere within 8 px of either end of the drag, and the canvas under both) and checks that each turn turned the camera by more than 5°. It had pressed at a fixed point, the frame's centre and 200 px down and right; once the map has built a press on a sphere grabs it, and the repository's grown picture put that point inside the `packages/engine` directory shell, so its eight turns dragged the shell, the camera never moved and `graph.ts` stayed behind the `packages/explorer` shell. On the docs before, `graph.ts` was clear at the first view and the turns were never needed ([the measurements](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/map-reds/README.md)).
- Since November 20, 2026, `uncover` asks what a press at a point would take hold of (`pressedAt`): the nearest sphere, or the seed of a wrapper skin met before it, a directory shell being drawn as its skin alone. `backgroundPoint` wants nothing at either end of the drag and 8 px around each, and `hittablePoint` wants `graph.ts`; the disc test before let a turn start on a shell's skin (the camera did not move) and a click land on the `explorer` shell standing in front of `graph.ts` ([the measurements](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/landing-reds/README.md#the-focus-case)). For its first hours the answer came from rays of the case's own against the drawn spheres and skins, a hundred lines that had to agree with the page's picker; it is now asked of that picker, which the scene offers its observers as `spatialPick` (`nodeAt` in `forceGraphRenderer.ts`).
- Since November 20, 2026, `expectFocused` reads in one look that the subject's name is shown and where it stands. After Centre on graph.ts the first case had looked for the name shown, found it mid-flight, and then read the place where the name had last stood after the page hid it, 14 to 46 px left of the room's centre, while the sphere rested at the centre to a tenth of a pixel. The page hid it because the file's own actions, holding keyboard focus on More, had stayed on the screen where the camera's flight left them, over the file; actions holding focus now go with their sphere, and the case checks after Centre on that they stand beside the file ([the run-down](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/landing-reds/README.md#the-focus-case-run-down)).
- The first test clicks the focused sphere at a point no nearer sphere covers, read from the rendered scene (2026-10-15, [Turn 10](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-14/2026-10-14.1.record.md#turn-10)): it had clicked the canvas centre, where `pathfind.ts`, a bigger neighbour, came to stand in front of `graph.ts` once the graph gained its files, and the panel's text check passed because `pathfind.ts`'s doc names `graph.ts`. The portable inspection target now proves the sphere's identity while the pin set stays empty; the reader's explicit Centre action exercises navigation.
- The search case goes through the search bar since 2026-10-14: Ctrl+P focuses its field, and the file chosen is pinned and focused, with no details panel opened. Manual-pan restoration is measured once the container says the simulation has settled; until 2026-10-16 the test waited out the library's fifteen-second cooldown, which the view no longer runs. A right-button pan must leave the context menu closed. The estate case also exercises reduced motion.
- The keyboard context journey moves the pointer away before opening More, lets focusout and hover-exit callbacks run, then checks that Escape restores focus to a visible control. The drag journey measures an actual change in the sphere's world position, waits beyond the hold threshold before release, and requires no menu, inspection or pin change. These cover failures exercised during the [October 20 continuation](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-20/2026-10-20.1.record.md#turn-2), rather than treating a pointer event alone as evidence that dragging happened.
- Real Tab navigation establishes keyboard attention while the pointer is on empty canvas or outside the view; a temporary peek at another sphere must return to that keyboard target. Moving focus elsewhere restores the retained scope even when the original hover-exit grace already expired.
- A separate journey begins in 2D with a neighbour pinned, switches to 3D, then releases that neighbour through the mouse-operated Unpin control. Moving onto empty canvas must restore every sphere's brightness while the mouse-focused button remains reachable. A subsequent Tab intentionally previews the same file without repinning it, and moving focus out of both controls and spatial names restores the full graph again. A name is itself a deliberate keyboard preview target.
- The switch's cost (2026-11-07): on the first case's picture, this repository's 3D map focused on `graph.ts`, a press of 2D and then of 3D are each timed in the page from the click until the press's own work is done (its handler and the microtasks it queued, read at the next task), and each must take under half a second beside the 2D map's own render of the picture, which any arrival in 2D pays and which the page measures as `live-docs:switch-render`. Before the fix the presses had blocked the page for about 10 s and 15 s, which had put the first case at its 30 s budget ([the switch-cost probe](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-07/Probes/switch-cost/README.md)); the case fails on that bundle. A timer every 20 ms from the press's return until the transition's layer goes must never wait a second (its longest about 0.2 to 0.3 s on the fixed bundle, a frame of the 3D picture's software renderer), so that the copying the switch now does in slices cannot grow back into one long task unseen. The same case watches each transition every frame until its layer goes, and requires that it still carry the focus's travelling name, draw the directory membranes and draw the cards folding, the transition the owner accepted on October 2. Since 2026-11-08 the case also notes the transition's start on the clock, when its layer is appended, and requires its first frame to follow within 400 ms: before the fix it came 4.6 s late on the way to 2D, and after it 83 to 179 ms on this machine.
- A stationary pointer must lose a sphere that camera zoom carries away; a touch held long enough to produce an actual pointer target must release that target on lift while keeping its explicit inspection. These hold the application-owned picker's lifecycle independently of the library's tooltip cache.
- Hit testing includes dim spheres, which remain interactive. Empty points are checked with projected screen radii, the actual DOM canvas, the application pointer target, so neither world-space measurements nor a covering control can masquerade as empty canvas.
- Full-repository navigation waits for actual stillness with a one-minute allowance. The [October 24 measurements](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-24/Probes/connections-tuning/performance-findings.md) found 31–33 seconds at the selected sphere detail, and over 25 seconds even at the old detail. These are functional journeys, not performance benchmarks; their camera, picking and attention assertions remain independent of that setup allowance.

Since 2026-10-31 (discovery, [Turn 4 of the October 31 record](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-31/2026-10-31.1.record.md#turn-4)) the frontier's spheres stand at .3 of their alpha by the picture's own rule, so the checks tell that dimming from the hover's fade (.15): a sphere faded by the hover reads under .25, and the hoverable candidates are the frontier's. Clearing the pins releases the subject too, so the picture becomes the layout's start, the archipelago of every group's seed since 2026-11-02, which the last check computes with the shared scope over every file, since a retain link's old grammar shows tests and assets both. The hover check re-enters its sphere at a point where it is hittable, since in the smaller picture a nearer sphere can cover another's centre, and its budget is 180 seconds for the two settles it waits through.

Since 2026-11-19 ([Turn 22 of the November 18 record](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-22)) a case holds the pointer's rest: a sweep through spheres at about a thousand pixels a second shows in no frame a sphere's actions, a wire's words or the fade, though the pointing hand shows; a rest shows the pointing hand first and the actions after it, and no fade before them (asserted in order, not by the clock); moving off takes them within the next frame; a pointer crossing from a rested sphere to its Pin reaches and presses it; and keyboard focus on the subject's name offers its actions on the next frame. Frames are read by the page at every animation frame (`pointer-frames.ts`). It failed on the build of main at `30eaee09`. Cases that hovered and read at once now wait on the page's own state for the rest.

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
- [`pointer-frames.framesDuring`](./pointer-frames.ts.mdmd.md#symbol-framesduring)
- [`pointer-frames.recordFrames`](./pointer-frames.ts.mdmd.md#symbol-recordframes)
- [`pointer-frames.restsOn`](./pointer-frames.ts.mdmd.md#symbol-restson)
- [`pointer-frames.sweepThrough`](./pointer-frames.ts.mdmd.md#symbol-sweepthrough)
- [`search-bar.currentSnapshot`](./search-bar.ts.mdmd.md#symbol-currentsnapshot)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
