# tests/e2e/force-graph-focus.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/force-graph-focus.spec.ts
- Generated At: 2026-10-20T16:20:30.338Z

## Authored
### Purpose
Exercises file focus and independent inspection in the rendered Force Graph through URLs, search, node clicks, filtering, resizing and return from Local Map. Guards context-menu focus restoration and the separation of node dragging from held actions.

### Notes

- The first test clicks the focused sphere at a point no nearer sphere covers, read from the rendered scene (2026-10-15, [Turn 10](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-14.1.record.md#turn-10)): it had clicked the canvas centre, where `pathfind.ts`, a bigger neighbour, came to stand in front of `graph.ts` once the graph gained its files, and the panel's text check passed because `pathfind.ts`'s doc names `graph.ts`. The portable inspection target now proves the sphere's identity while the pin set stays empty; the reader's explicit Centre action exercises navigation.
- The search case goes through the search bar since 2026-10-14: Ctrl+P focuses its field, and the file chosen is pinned and focused, with no details panel opened. Manual-pan restoration is measured once the container says the simulation has settled; until 2026-10-16 the test waited out the library's fifteen-second cooldown, which the view no longer runs. A right-button pan must leave the context menu closed. The estate case also exercises reduced motion.
- The keyboard context journey moves the pointer away before opening More, lets focusout and hover-exit callbacks run, then checks that Escape restores focus to a visible control. The drag journey measures an actual change in the sphere's world position, waits beyond the hold threshold before release, and requires no menu, inspection or pin change. These cover failures exercised during the [October 20 continuation](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md#turn-2), rather than treating a pointer event alone as evidence that dragging happened.
- Real Tab navigation establishes keyboard attention while the pointer is on empty canvas or outside the view; a temporary peek at another sphere must return to that keyboard target. Moving focus elsewhere restores the retained scope even when the original hover-exit grace already expired.
- A separate journey begins in 2D with a neighbour pinned, switches to 3D, then releases that neighbour through the mouse-operated Unpin control. Moving onto empty canvas must restore every sphere's brightness while the mouse-focused button remains reachable. A subsequent Tab intentionally previews the same file without repinning it, and leaving the controls restores the full graph again.
- A stationary pointer must lose a sphere that camera zoom carries away; a touch held long enough to produce an actual pointer target must release that target on lift while keeping its explicit inspection. These hold the application-owned picker's lifecycle independently of the library's tooltip cache.
- Hit testing includes dim spheres, which remain interactive. Empty points are checked with projected screen radii, the actual DOM canvas, the application pointer target and the native tooltip, so neither world-space measurements nor a covering control can masquerade as empty canvas.

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
- [`search-bar.currentSnapshot`](./search-bar.ts.mdmd.md#symbol-currentsnapshot)
- [`still-picture.localRetainUrl`](./still-picture.ts.mdmd.md#symbol-localretainurl)
<!-- LIVE-DOC:END Dependencies -->
