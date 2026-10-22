# tests/e2e/local-map-motion.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/local-map-motion.spec.ts
- Generated At: 2026-10-22T02:20:05.196Z

## Authored
### Purpose
Checks animated pin changes in the browser: retained wrappers and wires keep their identities, the acted-on symbol row stays in place, other cards move continuously, and the settled picture has no animation residue.

### Notes
- Records every frame from inside the page, a `requestAnimationFrame` loop started before the click, since the test runner's own clock and its tracing say nothing about when the page drew: the first version sampled from outside and found the move over at moments it was not. The test's move is seeded long (1,500 ms) so that its frames fall inside it on any machine; the row it pins is on a card wholly in the frame, since the map does not scroll and a click lands only on what is shown. Written 2026-10-07 after the move was judged by eye in the frames under `AI-Agent-Workspace/Screenshots/2026-10-07/` ([Turn 16](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-06.1.record.md#turn-16)).
- The seeds it writes keep the search off, so that only the click moves the picture (2026-10-07).
- Direct symbol Pin is the action, and the held measurement is the symbol label's screen position, including its movement within the card. The original test held the containing card; the [October 19 connection-following requirement](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-19.1.record.md#turn-24) and [October 20 visual inspection](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md#turn-2) make the acted-on row the identity to preserve. The 1.5-pixel tolerance remains, alongside shared wrapper identity, monotonic movement of other cards and the absence of fades or row transforms at rest.
- The interrupted, zoomed transition case retains the same SVG wire element, checks each endpoint against its actual pin on every sampled frame, requires entering wires to fade with their cards, and rejects a restarted layer fade. A stable Pin-button locator permits a second keyboard activation after its accessible name changes to Unpin. Zero-duration and reduced-motion cases still require the next arrangement to be settled immediately.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page`, `expect`, `test`
- [`local-storage.PERSISTED_UI_KEY`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-persisted_ui_key)
- [`local-storage.PERSISTED_UI_VERSION`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-persisted_ui_version)
- [`still-picture.localMapSettled`](./still-picture.ts.mdmd.md#symbol-localmapsettled)
- [`still-picture.localRetainUrl`](./still-picture.ts.mdmd.md#symbol-localretainurl)
<!-- LIVE-DOC:END Dependencies -->
