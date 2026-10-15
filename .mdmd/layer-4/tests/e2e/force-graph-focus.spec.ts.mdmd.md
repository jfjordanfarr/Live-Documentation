# tests/e2e/force-graph-focus.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/force-graph-focus.spec.ts
- Generated At: 2026-10-14T02:49:23.268Z

## Authored
### Purpose
Exercises file focus in the rendered Force Graph through URLs, search, node clicks, filtering, resizing and return from Local Map.

### Notes

- The first test clicks the focused sphere at a point no nearer sphere covers, read from the rendered scene (2026-10-15, [Turn 10](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-14.1.record.md#turn-10)): it had clicked the canvas centre, where `pathfind.ts`, a bigger neighbour, came to stand in front of `graph.ts` once the graph gained its files, and the panel's text check passed because `pathfind.ts`'s doc names `graph.ts`; the search bar's field now says which file the click pinned.
The canvas-center click verifies the actual sphere’s identity rather than only its HTML label. The search case goes through the search bar since 2026-10-14: Ctrl+P focuses its field, and the file chosen is pinned and focused, with no details panel opened. Manual-pan restoration is measured after the existing force simulation’s 15-second cooldown. The estate case also exercises reduced motion.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page`, `expect`, `test`
- [`force-graph-observation.observeGraph`](./force-graph-observation.ts.mdmd.md#symbol-observegraph)
- [`force-graph-observation.renderedNodes`](./force-graph-observation.ts.mdmd.md#symbol-renderednodes)
- [`still-picture.localRetainUrl`](./still-picture.ts.mdmd.md#symbol-localretainurl)
<!-- LIVE-DOC:END Dependencies -->
