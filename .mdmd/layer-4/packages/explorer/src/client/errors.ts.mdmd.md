# packages/explorer/src/client/errors.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/errors.ts
- Generated At: 2026-11-12T17:12:09.841Z

## Authored
### Purpose
What the Explorer says when it cannot start, or stops: the status line in the sidebar's footer reads `Error: <message>`. A refusal the reader can act on, an `ExplorerRefusal`, is also its one sentence where the map would be, at reading size and alone; a fault the reader cannot act on opens the detail panel with its stack.

### Notes
- Created 2025-11-21 to surface JavaScript errors during development.
- `attachGlobalErrorHandler` listens for the window's `error` event and reports the first fault; promise rejections are not listened for, since the bootstrap in `index.ts` catches its own and reports them here.
- `ExplorerRefusal` and `OPENED_AS_FILE` (2026-11-12): a page opened as a file sat at "Loading..." forever, the second finding of [the first-visit evaluation](../../../../../../AI-Agent-Workspace/Screenshots/2026-11-12/first-visit/README.md). The client now loads as a classic script, which a browser still runs for a page opened as a file, and `index.ts` refuses before asking for any data, with one sentence saying the Explorer must be served.
- The sentence was first said only in the status line, 11 px grey at the sidebar's foot, where the first visitor had not noticed "Loading..."; the same day a refusal became a paragraph in `#views`, `#explorer-refusal`, styled by `.explorer-refusal` in [shell.css](styles/shell.css.mdmd.md) at the reader's size and colour. The status line keeps its `Error:` copy, the form [the no-network spec](../../../../tests/e2e/no-network.spec.ts.mdmd.md) pins; a second refusal replaces the first, so the main area never says two. The page's other refusals a reader can act on, data or a history off the page's own site, missing, or not of a form this Explorer reads, take the same form; a later failure to load the history is said by the history control.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ExplorerRefusal` {#symbol-explorerrefusal}
- Type: class
- Source: [source](../../../../../../packages/explorer/src/client/errors.ts#L19)

##### `ExplorerRefusal` — Summary
What stops the Explorer that the reader can act on, said in one plain sentence: shown where the map would be, never with a stack.

#### `OPENED_AS_FILE` {#symbol-opened_as_file}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/errors.ts#L22)

##### `OPENED_AS_FILE` — Summary
The refusal of a page opened as a file, whose browser lets it read nothing beside it (2026-11-12).

#### `reportFatalExplorerError` {#symbol-reportfatalexplorererror}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/errors.ts#L57)

##### `reportFatalExplorerError` — Summary
Says what stopped the Explorer in the status line, as `Error: <message>`. A refusal is also its one sentence where
the map would be, at reading size and alone; a fault the reader cannot act on opens the detail panel with its
encoded stack.

#### `attachGlobalErrorHandler` {#symbol-attachglobalerrorhandler}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/errors.ts#L95)

##### `attachGlobalErrorHandler` — Summary
Installs a `window.error` listener that delegates to {@link reportFatalExplorerError}.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`template.detail-body`](../shared/template.html.mdmd.md#symbol-detail-body)
- [`template.detail-panel`](../shared/template.html.mdmd.md#symbol-detail-panel)
- [`template.stats-line`](../shared/template.html.mdmd.md#symbol-stats-line)
- [`template.views`](../shared/template.html.mdmd.md#symbol-views)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
