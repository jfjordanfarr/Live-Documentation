# `tests/e2e/bare-frame.spec.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/e2e/bare-frame.spec.ts`
- Generated At: 2026-11-19T21:10:19.845Z

## Authored
### Purpose
Checks the Bare frame's trial in the built page, at 1440 by 900 and 390 by 844: the sidebar by default; under Bare, the crumbs from the World Map to the file and a directory's crumb going out to it; the key with the filters and the legend, closed by Escape back to its button; the Tuning sheet with its count and Reset, and its Frame lever returning everything to the sidebar; the views' menu; and the narrow window's lone crumb, its way out and the menu on its own ground. It asserts state and order only, never a time.

### Notes
- Written on 2026-11-19 with the trial ([Turn 34 of the November 18 record](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-34)). Two of its cases came from defects the pictures showed: a page that started under Bare could not change view, and the narrow views' menu stood ten pixels tall.
- The pictures it protects are in `AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Screenshots/bare-frame/`.

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
<!-- LIVE-DOC:END Dependencies -->
