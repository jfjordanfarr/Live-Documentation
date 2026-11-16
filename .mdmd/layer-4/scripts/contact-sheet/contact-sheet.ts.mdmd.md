# scripts/contact-sheet/contact-sheet.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/contact-sheet/contact-sheet.ts
- Entry: command `contact:sheet` of [`package.json`](../../package.json.mdmd.md)
- Generated At: 2026-11-16T20:22:08.357Z

## Authored
### Purpose
Draws one built Explorer in a fixed list of views and writes each picture and one sheet of them as labelled tiles, so that a change of colour can be judged over many views at once and the same sheet drawn again in another palette and set beside it.

### Notes
- Written on 2026-11-16 for the colour pass ([Turn 1 of the November 16 session](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-16.1.record.md#turn-1)), by a builder to the root's brief. The owner's bar for a choice of colours by kind was to see it "across a ton of views" ([Turn 11 of the November 15 session](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-15.1.record.md#turn-11)); until then each comparison was a handful of screenshots taken by a scratch script and thrown away.
- `npm run contact:sheet -- --bundle <built bundle> --preset repository|estate|tidepool --out <dir>`. The views: the 2D map with a directory open at three zooms, a pinned file, both keys, the 3D map at its start, pinned and in Structure with assets and both kinds of documents shown, a step of history in Dim and in Glow, the World Map light and dark, the reader and Knowledge Sources. A bundle without a board or a history is drawn without those tiles. Every Local Map view turns Show Tests and Show Assets on, since a directory's make-up is the thing looked at.
- `--hook <module>` names a module whose default export runs on each fresh browser context before its page loads; that is where a saved setting such as a palette is put in place, and the tool merges its own settings into what the hook saved instead of replacing it. `--only` redraws named views and keeps the folder's other pictures in the sheet.
- The bundle is answered from disk under an origin of the tool's own, so nothing is served on a port. Pictures are scratch or go to the day's probe folder; they are not committed with the tool. This container has no Segoe UI, so text is drawn in a fallback face: colours and shapes are the owner's, line breaks are not.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ContactSheetHook` {#symbol-contactsheethook}
- Type: type
- Source: [source](../../../../scripts/contact-sheet/contact-sheet.ts#L48)
- Parameters: `context`: `BrowserContext`

##### `ContactSheetHook` — Summary
The hook a caller passes, run on every fresh context before the view's page loads.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `BrowserContext`, `Page`, `chromium`
- `node:fs/promises`
- `node:path` - `path`
- `node:url` - `pathToFileURL`
- [`compressed-url-state.DEFAULT_SNAPSHOT`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-default_snapshot)
- [`compressed-url-state.UrlStateSnapshot`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-urlstatesnapshot)
- [`compressed-url-state.compressSnapshot`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-compresssnapshot)
- [`local-storage.PERSISTED_UI_KEY`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-persisted_ui_key)
- [`local-storage.PERSISTED_UI_VERSION`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-persisted_ui_version)
- [`cli.UsageError`](../live-docs/cli.ts.mdmd.md#symbol-usageerror)
- [`cli.optionValue`](../live-docs/cli.ts.mdmd.md#symbol-optionvalue)
- [`cli.runCommand`](../live-docs/cli.ts.mdmd.md#symbol-runcommand)
- [`still-picture.localMapStill`](../../tests/e2e/still-picture.ts.mdmd.md#symbol-localmapstill)
<!-- LIVE-DOC:END Dependencies -->
