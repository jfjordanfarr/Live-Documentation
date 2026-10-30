# tests/e2e/world-map-estate.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/world-map-estate.spec.ts
- Generated At: 2026-10-22T16:47:59.029Z

## Authored
### Purpose
Keeps the estate sample on its own board, the owner's target shape: seven things in two regions, the declared crossing, a call in the air and the library the services stand on; its labels off each other at rest and with the built-on layer showing; Portal's pinned panel at 1280×800 at most half the viewport tall, scrolling inside and narrower than half the view, its names at least 12 px in the panel's own face and each with its link; and the gateway and the hub opened into the Local Map on their folders, where nothing collides and nothing is cut off.

### Notes
- Written on 2026-09-29 with the design audit ([Turn 48](../../../../AI-Agent-Workspace/ChatHistory/2026/09/Summarized/2026-09-27.1.SUMMARIZED.md#turn-48)), over the bundle `scripts/live-docs/visualize-sample.ts` builds into `samples/estate/`. The Playwright suite builds both bundles first, since the same session found stale bundles passing ([Turn 13 of the September 29 session](../../../../AI-Agent-Workspace/ChatHistory/2026/09/Summarized/2026-09-29.2.SUMMARIZED.md#turn-13)), so this spec runs on fresh output.
- The panel's test was added on 2026-10-30 for the October 23 review's finding, accepted at [Turn 3](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-30.1.record.md#turn-3), that the pinned panel was cramped and covered the map. Portal is measured because its evidence is longer than the cap at that size, so the test fails if the cap goes: before the change the panel stood 486 px tall with its names at 11 px monospace.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page`, `expect`, `test`
- [`design-audit.describeFaults`](./design-audit.ts.mdmd.md#symbol-describefaults)
- [`design-audit.overlapsAmong`](./design-audit.ts.mdmd.md#symbol-overlapsamong)
- [`design-audit.textBoxes`](./design-audit.ts.mdmd.md#symbol-textboxes)
- [`design-audit.truncations`](./design-audit.ts.mdmd.md#symbol-truncations)
- [`still-picture.LOCAL_MAP`](./still-picture.ts.mdmd.md#symbol-local_map)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
