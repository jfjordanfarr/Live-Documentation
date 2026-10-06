# scripts/layout-lab/capture.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/layout-lab/capture.ts
- Generated At: 2026-10-06T20:39:25.783Z

## Authored
### Purpose

The layout lab's capture of a Local Map scope: everything the card model needs to size every card at any width, read once from the built page in a browser, with the page's own numbers as the truth the model is held to.

### Notes

Opens the scope with every file retained whole (its own browser over the built bundle through `scopes.ts`, or a page the Playwright runner already shows) and reads it in one evaluation: every card's natural width, border and padding; every text block prepared by Pretext inside the page, where the canvas knows the fonts, and serialized whole so `layoutWithLines` reads it back in node; every row's badge width; every test chip; each pin's horizontal place from a dot the page shows (a card whose rows are all collapsed has none, and then the grid's geometry says where one would be); the stylesheet's constants from computed styles and from probe elements, since a card's first dot may be collapsed to nothing; the height of one line of each font from a probe that stays until the membrane labels are read too; and the truth: each card's height and each pin's offset as the renderer rounds them, each label's height, the placement measure and the picture's size. Pretext's layout of each shown text at its element's width is checked against the element's own height as the capture runs, with the browser's one layout unit of tolerance, and disagreements are reported. The page runs code compiled by tsx, whose esbuild keeps function names by wrapping them in `__name(...)`, a helper the page lacks; `admitCompiledFunctions` defines it there first. A capture weighs hundreds of kilobytes and is rebuilt in seconds, so captures are not committed. Built 2026-10-06 for the lab the owner asked for ([Turn 7](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-06.1.record.md#turn-7)), after the owner connected Pretext to the problem ([Turn 9](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-06.1.record.md#turn-9)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `PreparedText` {#symbol-preparedtext}
- Type: interface
- Source: [source](../../../../scripts/layout-lab/capture.ts#L21)

##### `PreparedText` — Summary
A text as Pretext prepared it in the page: its segments and their measured widths, laid out again by arithmetic.

#### `FontMetrics` {#symbol-fontmetrics}
- Type: interface
- Source: [source](../../../../scripts/layout-lab/capture.ts#L30)

##### `FontMetrics` — Summary
A font as the page renders it: the canvas font string, the letter spacing, and the height of one line.

#### `RowCapture` {#symbol-rowcapture}
- Type: interface
- Source: [source](../../../../scripts/layout-lab/capture.ts#L39)

##### `RowCapture` — Summary
One symbol row of a card: its name, its label's prepared text and the width of its type badges.

#### `ChipCapture` {#symbol-chipcapture}
- Type: interface
- Source: [source](../../../../scripts/layout-lab/capture.ts#L48)

##### `ChipCapture` — Summary
A test chip's, or the test label's, box as the page drew it.

#### `CardCapture` {#symbol-cardcapture}
- Type: interface
- Source: [source](../../../../scripts/layout-lab/capture.ts#L54)

##### `CardCapture` — Summary
One card, as the page built it.

#### `CardConstants` {#symbol-cardconstants}
- Type: interface
- Source: [source](../../../../scripts/layout-lab/capture.ts#L80)

##### `CardConstants` — Summary
The page's constants the card model composes with, read from computed styles.

#### `Capture` {#symbol-capture}
- Type: interface
- Source: [source](../../../../scripts/layout-lab/capture.ts#L102)

##### `Capture` — Summary
A scope's capture: the fonts, the constants, every card, every label, the page's truth and the warnings.

#### `captureScope` {#symbol-capturescope}
- Type: function
- Source: [source](../../../../scripts/layout-lab/capture.ts#L124)
- Parameters: `run`: [`ScopeRun`](./scopes.ts.mdmd.md#symbol-scoperun)

##### `captureScope` — Summary
Opens the scope in a browser of the lab's own over the built bundle and reads the capture.

#### `captureFromPage` {#symbol-capturefrompage}
- Type: function
- Source: [source](../../../../scripts/layout-lab/capture.ts#L141)
- Parameters: `page`: `Page`; `run`: [`ScopeRun`](./scopes.ts.mdmd.md#symbol-scoperun)

##### `captureFromPage` — Summary
Reads the capture from a page already showing the scope's retained Local
Map, under any origin: Pretext is served to the page from the lab's own
node_modules and loaded as a module, then the page is read in one go.

#### `writeCapture` {#symbol-writecapture}
- Type: function
- Source: [source](../../../../scripts/layout-lab/capture.ts#L344)
- Parameters: `capture`: [`Capture`](#symbol-capture)

##### `writeCapture` — Summary
Writes a capture as compact JSON.

#### `readCaptureFile` {#symbol-readcapturefile}
- Type: function
- Source: [source](../../../../scripts/layout-lab/capture.ts#L350)

##### `readCaptureFile` — Summary
Reads a capture written by `writeCapture`.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page`, `chromium`
- `node:fs/promises`
- `node:path` - `path`
- [`card-model.TEXT_TOLERANCE`](./card-model.ts.mdmd.md#symbol-text_tolerance)
- [`scopes.ORIGIN`](./scopes.ts.mdmd.md#symbol-origin)
- [`scopes.ScopeRun`](./scopes.ts.mdmd.md#symbol-scoperun)
- [`scopes.admitCompiledFunctions`](./scopes.ts.mdmd.md#symbol-admitcompiledfunctions)
- [`scopes.serveBundle`](./scopes.ts.mdmd.md#symbol-servebundle)
- [`still-picture.localRetainUrl`](../../tests/e2e/still-picture.ts.mdmd.md#symbol-localretainurl)
<!-- LIVE-DOC:END Dependencies -->
