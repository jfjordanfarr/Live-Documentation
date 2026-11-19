# scripts/contact-sheet/bundle-page.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/contact-sheet/bundle-page.ts
- Generated At: 2026-11-19T00:59:28.194Z

## Authored
### Purpose
Shares what the contact sheet and the marble sheet both need: a built Explorer bundle served from disk under an origin of its own, and the viewer's saved settings written in before a page loads.

### Notes
- Split out of `contact-sheet.ts` on 2026-11-18, when the marble sheet ([Turn 20 of the November 18 record](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-20)) needed the same two helpers. The contact sheet could not be imported for them, since it runs its command as soon as it loads.
- The settings script goes to the page as text, not as a function: tsx names a compiled function's inner functions with a helper the page lacks, and on 2026-11-17 that made the script fail in the page before it wrote anything.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ORIGIN` {#symbol-origin}
- Type: const
- Source: [source](../../../../scripts/contact-sheet/bundle-page.ts#L15)

##### `ORIGIN` — Summary
The origin a bundle is served under.

#### `serve` {#symbol-serve}
- Type: function
- Source: [source](../../../../scripts/contact-sheet/bundle-page.ts#L23)
- Parameters: `context`: `BrowserContext`

##### `serve` — Summary
Answers the page's requests from the bundle on disk, under an origin of its own.

#### `mergeStorage` {#symbol-mergestorage}
- Type: function
- Source: [source](../../../../scripts/contact-sheet/bundle-page.ts#L40)
- Parameters: `context`: `BrowserContext`

##### `mergeStorage` — Summary
Merges settings into the persisted UI a hook may already have written. The script is given as text: a function passed
from here is compiled by tsx, which names its inner functions with a helper the page does not have, and the script
then failed in the page before writing anything (found 2026-11-17, when no setting reached a page).

#### `escape` {#symbol-escape}
- Type: const
- Source: [source](../../../../scripts/contact-sheet/bundle-page.ts#L54)

##### `escape` — Summary
A text made safe to stand in HTML.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `BrowserContext` (type-only)
- `node:fs/promises`
- `node:path` - `path`
- [`local-storage.PERSISTED_UI_KEY`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-persisted_ui_key)
- [`local-storage.PERSISTED_UI_VERSION`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-persisted_ui_version)
<!-- LIVE-DOC:END Dependencies -->
