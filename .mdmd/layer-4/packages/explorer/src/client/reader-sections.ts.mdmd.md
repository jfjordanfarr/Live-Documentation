# packages/explorer/src/client/reader-sections.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/reader-sections.ts
- Generated At: 2026-10-30T15:19:37.309Z

## Authored
### Purpose
A Live Doc's authored block in the reader's order, pure. `authoredSections` cuts the block at its level-three headings outside fences, keeping any words before the first heading as a section without one; joined with newlines, the sections are the block. `readerOrder` puts Purpose, and any opening words, above the generated facts and every other section, Notes among them, after them in the order the author wrote them. [detailPanel.ts](detailPanel.ts.mdmd.md) renders what it returns.

### Notes
- Written on 2026-10-30 for the order the owner chose that day ([Turn 3](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-30.1.record.md#turn-3)): Purpose, then the symbols, dependencies, dependents and Cited By, then Notes. Until then the reader showed the whole block first, and 23 of this repository's docs carry more than 4,000 characters of Notes.
- The grammar in `document.ts` keeps the authored block verbatim and names no sections inside it. The sections are the level-three headings because the block a new doc starts with has them (`DEFAULT_AUTHORED_BLOCK`: "### Purpose", "### Notes") and the docs' lint reads Purpose and Notes at that level, without regard to case, as this does. Deeper headings and level-two lines stay words of their section. Every doc in this repository has exactly the two sections; a third, or words before the first, are kept for other repositories.
- Fences and headings are read by the renderer's own `fenceClosing` and `headingOf` from [markdown.ts](markdown.ts.mdmd.md), so that a `###` line inside a fence is code to both.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `AuthoredSection` {#symbol-authoredsection}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/reader-sections.ts#L12)

##### `AuthoredSection` — Summary
One authored section: its heading's text, or null for words before the first heading, and its markdown, heading line included.

#### `ReaderOrder (interface)` {#symbol-readerorder-interface}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/reader-sections.ts#L18)

##### `ReaderOrder (interface)` — Summary
The authored sections in the reader's order: those above the generated facts and those after them.

#### `authoredSections` {#symbol-authoredsections}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/reader-sections.ts#L32)
- Returns: [`AuthoredSection`](#symbol-authoredsection)[]

##### `authoredSections` — Summary
The authored block cut at its level-three headings, outside fences, as the reader's renderer reads them. Nothing
is dropped or moved: the sections' markdown, joined with newlines, is the block.

#### `readerOrder (function)` {#symbol-readerorder-function}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/reader-sections.ts#L59)
- Returns: [`ReaderOrder`](#symbol-readerorder-interface)

##### `readerOrder (function)` — Summary
Purpose, and any words before the first heading, above the generated facts; every other section after them, in order.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`markdown.fenceClosing`](./markdown.ts.mdmd.md#symbol-fenceclosing)
- [`markdown.headingOf`](./markdown.ts.mdmd.md#symbol-headingof)
<!-- LIVE-DOC:END Dependencies -->
