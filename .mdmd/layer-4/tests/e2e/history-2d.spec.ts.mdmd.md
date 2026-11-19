# tests/e2e/history-2d.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/history-2d.spec.ts
- Generated At: 2026-11-19T05:52:38.359Z

## Authored
### Purpose
Holds the history in the 2D Local Map, its first rung, over the scripted history sample: the one scrubber standing over the 2D map with the controls clear of it, also after the page is narrowed; a past moment's card counting its file's symbols then, with no description or other words of today; the moment held across 2D, 3D and 2D and in the address; a pin absent at the moment said so in the tray's words; a dragged thumb leaving the cards in place and the rest settling them at the moment; a closed directory holding the step's change lit; and an address naming a past commit opening on its pinned card.

### Notes
- Written on 2026-11-19 for the owner's request in [Turn 34 of the November 18 record](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-34): "We should be able to scrub through history in the same shared control whose state is continuous in 2D and 3D local map." The rules it holds are in [the Explorer design](../../../layer-3/live-documentation-explorer.mdmd.md) (History) and [the visual foundations](../../../layer-2/design-system/visual-foundations.mdmd.md).
- The cases assert state and order, never a duration. The drag case failed on the first pass's build, where a released thumb left the 2D map on the cards of the step the drag began from.

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
- [`compressed-url-state.decompressSnapshot`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-decompresssnapshot)
- [`still-picture.localMapSettled`](./still-picture.ts.mdmd.md#symbol-localmapsettled)
<!-- LIVE-DOC:END Dependencies -->
