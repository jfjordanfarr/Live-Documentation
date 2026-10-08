# packages/explorer/src/client/persistence/history.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/persistence/history.test.ts
- Generated At: 2026-09-30T01:36:12.234Z

## Authored
### Purpose
Keeps the one decision `history.ts` makes, what a write to the address does to the browser's history: a move to another place adds an entry once the person has touched the page; the same place, as for a pin, a card or a pan, rewrites the entry; an unchanged address does nothing; nothing is added while the page starts up or restores an entry; and a write in the same task as a new entry joins it, so one click is one step back.

### Notes
- Written on 2026-09-30 with Back and Forward ([Turn 16](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/09/Summarized/2026-09-29.2.SUMMARIZED.md#turn-16)), at the owner's ask of [Turn 14](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/09/Summarized/2026-09-29.2.SUMMARIZED.md#turn-14) ("I am known to hop around navigating a lot"); the module's own doc says why each rule is as it is. Pure cases over `HistoryWrite`; the browser's part is kept by `tests/e2e/explorer-history.spec.ts`.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`history.HistoryWrite`](./history.ts.mdmd.md#symbol-historywrite)
- [`history.entryFor`](./history.ts.mdmd.md#symbol-entryfor)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
