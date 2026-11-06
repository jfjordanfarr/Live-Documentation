# tests/e2e/local-map-learning.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/local-map-learning.spec.ts
- Generated At: 2026-11-06T03:23:54.365Z

## Authored
### Purpose
Exercises named relationship navigation, cycle explanations, header anchoring, and touch access to long portrait cards in the actual Explorer.

### Notes
Introduced during the November 4 learning-journey pass. The fixture has independently known service, configuration and data-context relationships. Browser input verifies connected-file selection and Back, explicit reading versus retention, and real touch taps, holds and swipes; tests do not substitute forced offscreen clicks for usable navigation. See [the authorization and findings](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-04.1.record.md#turn-8).

A later review found that Back restored the correct settled camera but temporarily lost the returning title. The phone case samples every animation frame as well as comparing the final title and camera with entry; this distinguishes a bad transition from a persistent restoration failure.

The first full gate caught a separate persistent failure after pinning: header growth during the native move left the title above the usable frame. The regression settles initial arrival, uses a deliberate 1,200 ms move, and requires the larger header while that move is still active before checking final visibility, unchanged horizontal placement and exact pins. It fails against the previous bundle, so stable initial camera setup cannot disguise the animation defect.

Since [November 5](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-1) a tap on the card's body opens nothing: the phone case now checks that a tap on the path leaves the reader closed and that a tap on the file's name folds its reading, the book agreeing, with the evidence reader reached through the stationary hold's menu above.

Since [Turn 11](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-11), when Card Text came to default to the fixed-slot composition, this spec pins the growing composition in its init script, since its journeys read that composition's recorded facts and in-place descriptions; the composition not chosen is to be deleted with its spec when the owner decides.

Since [Turn 12](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-12--november-6) every journey here keeps the growing composition through `keepGrowingComposition`, since the relationship counts and the reading frame are that composition's.

Later on [Turn 12](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-12--november-6) the phone swipe case waits for the card to stand still on screen, since the reading frame slides it in after the layout settles and under load the scan once ran while the card was still off to the right.

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
- [`still-picture.keepGrowingComposition`](./still-picture.ts.mdmd.md#symbol-keepgrowingcomposition)
- [`still-picture.localMapSettled`](./still-picture.ts.mdmd.md#symbol-localmapsettled)
- [`still-picture.panIntoView`](./still-picture.ts.mdmd.md#symbol-panintoview)
<!-- LIVE-DOC:END Dependencies -->
