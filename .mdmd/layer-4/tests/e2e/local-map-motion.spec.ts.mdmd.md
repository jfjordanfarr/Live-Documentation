# tests/e2e/local-map-motion.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/local-map-motion.spec.ts
- Generated At: 2026-10-07T02:59:53.467Z

## Authored
### Purpose
Holds the animated re-layout in a real browser: a pin moves the picture, the clicked card holds still, every shared card keeps its element, every far-moving card goes one way and is part way at the middle frame, and nothing of the move remains at rest; with the move length at zero or motion reduced the picture jumps.

### Notes
- Records every frame from inside the page, a `requestAnimationFrame` loop started before the click, since the test runner's own clock and its tracing say nothing about when the page drew: the first version sampled from outside and found the move over at moments it was not. The test's move is seeded long (1,500 ms) so that its frames fall inside it on any machine; the row it pins is on a card wholly in the frame, since the map does not scroll and a click lands only on what is shown. Written 2026-10-07 after the move was judged by eye in the frames under `AI-Agent-Workspace/Screenshots/2026-10-07/` ([Turn 16](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-06.1.record.md#turn-16)).
- The seeds it writes keep the search off, so that only the click moves the picture (2026-10-07).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page`, `expect`, `test`
- [`local-storage.PERSISTED_UI_KEY`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-persisted_ui_key)
- [`still-picture.localMapSettled`](./still-picture.ts.mdmd.md#symbol-localmapsettled)
- [`still-picture.localRetainUrl`](./still-picture.ts.mdmd.md#symbol-localretainurl)
<!-- LIVE-DOC:END Dependencies -->
