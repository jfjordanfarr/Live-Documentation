# tests/e2e/local-map-learning.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/local-map-learning.spec.ts
- Generated At: 2026-11-05T00:43:17.184Z

## Authored
### Purpose
Exercises named relationship navigation, cycle explanations, header anchoring, and touch access to long portrait cards in the actual Explorer.

### Notes
Introduced during the November 4 learning-journey pass. The fixture has independently known service, configuration and data-context relationships. Browser input verifies connected-file selection and Back, explicit reading versus retention, and real touch taps, holds and swipes; tests do not substitute forced offscreen clicks for usable navigation. See [the authorization and findings](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-04.1.record.md#turn-8).

A later review found that Back restored the correct settled camera but temporarily lost the returning title. The phone case samples every animation frame as well as comparing the final title and camera with entry; this distinguishes a bad transition from a persistent restoration failure.

The first full gate caught a separate persistent failure after pinning: header growth during the native move left the title above the usable frame. The regression settles initial arrival, uses a deliberate 1,200 ms move, and requires the larger header while that move is still active before checking final visibility, unchanged horizontal placement and exact pins. It fails against the previous bundle, so stable initial camera setup cannot disguise the animation defect.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page`, `expect`, `test`
- [`compressed-url-state.decompressSnapshot`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-decompresssnapshot)
- [`local-storage.PERSISTED_UI_KEY`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-persisted_ui_key)
- [`local-storage.PERSISTED_UI_VERSION`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-persisted_ui_version)
- [`still-picture.LOCAL_MAP`](./still-picture.ts.mdmd.md#symbol-local_map)
- [`still-picture.dragBy`](./still-picture.ts.mdmd.md#symbol-dragby)
- [`still-picture.localMapSettled`](./still-picture.ts.mdmd.md#symbol-localmapsettled)
- [`still-picture.panIntoView`](./still-picture.ts.mdmd.md#symbol-panintoview)
<!-- LIVE-DOC:END Dependencies -->
