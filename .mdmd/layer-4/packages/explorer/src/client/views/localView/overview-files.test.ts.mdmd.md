# `packages/explorer/src/client/views/localView/overview-files.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/explorer/src/client/views/localView/overview-files.test.ts`
- Generated At: 2026-11-19T21:10:16.975Z

## Authored
### Purpose
Unit cases for the overview's files-only trial: the look and the choices at which it draws files only, the element held still while the layout changes, and Fit's frame of the picture with its rows.

### Notes
Written with the trial on 2026-11-13 ([November 13, Turn 8](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-13/2026-11-13.1.record.md#turn-8)). The browser behaviour, the compact cards, the pair lines, the held element and the return to the picture that stood, is held by `tests/e2e/overview-files.spec.ts`.

A case of 2026-11-15 holds `wholeNameScale`: the look's size when the name is whole there, the largest tenth below it otherwise, and the connections look's as the floor ([Turn 1 of that day's record](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-1)).

A case of 2026-11-15 holds `pinnedRowScales` ([Turn 1 of that day's record](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-1)): two pinned rows of one card at the lesser of their scales, an unpinned row keeping its own and setting nothing. It fails against each row keeping its own scale, `[2.3, 2.7]` where `[2.3, 2.3]` is asked.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`overview-files.filesNameScale`](./overview-files.ts.mdmd.md#symbol-filesnamescale)
- [`overview-files.heldIndex`](./overview-files.ts.mdmd.md#symbol-heldindex)
- [`overview-files.overviewFilesShown`](./overview-files.ts.mdmd.md#symbol-overviewfilesshown)
- [`overview-files.pinnedRowScales`](./overview-files.ts.mdmd.md#symbol-pinnedrowscales)
- [`overview-files.rowsFrame`](./overview-files.ts.mdmd.md#symbol-rowsframe)
- [`overview-files.wholeNameScale`](./overview-files.ts.mdmd.md#symbol-wholenamescale)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
