# tests/e2e/explorer-history.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/explorer-history.spec.ts
- Generated At: 2026-10-22T16:47:58.081Z

## Authored
### Purpose
Keeps Back and Forward in the browser: the views visited walk back and forward by the page's two buttons and the browser's, with the buttons disabled at either end; an opened folder of the Local Map is a step back and the pins made in it are not, so the place comes back with its pins and one more step leaves the folder; and a thing opened from the World Map is a step back to the board, with Forward opening it again.

### Notes
- Written on 2026-09-30 with Back and Forward ([Turn 16](../../../../AI-Agent-Workspace/ChatHistory/2026/09/Summarized/2026-09-29.2.SUMMARIZED.md#turn-16)), as the owner asked: "we can split out the pinning history from the navigation history". The unit side is `persistence/history.test.ts` and `persistence/place.test.ts`; this spec is where the browser's own history is driven, which no unit test can.
- The pin-within-a-folder journey uses the explicit Pin control and requires the reader to remain closed, so retention cannot accidentally add an evidence-history step. The original assertions also retain an open tray across navigation back to the map. This preserves the distinction while applying the [October 20 inspect-first grammar](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md#turn-2).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page`, `expect`, `test`
- [`search-bar.currentSnapshot`](./search-bar.ts.mdmd.md#symbol-currentsnapshot)
- [`still-picture.localMapSettled`](./still-picture.ts.mdmd.md#symbol-localmapsettled)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
