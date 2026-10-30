# packages/explorer/src/client/reader-sections.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/reader-sections.test.ts
- Generated At: 2026-10-30T15:19:37.288Z

## Authored
### Purpose
Vitest over [reader-sections.ts](reader-sections.ts.mdmd.md): the block a new doc starts with is cut into Purpose and Notes, and a long block only at its level-three headings outside backtick and tilde fences, with deeper headings and level-two lines kept in their section; words before the first heading are kept; the sections joined are always the block; Purpose comes up wherever it was written and in any case, the rest keep the author's order; and the sections rendered part by part with one slugger are exactly the whole block rendered, a second Purpose heading keeping `purpose-1` where a fresh slugger would name it `purpose` again.

### Notes
- Written on 2026-10-30 with the module. The last case is why the reader shares one slugger: a provenance link to a repeated heading's anchor must land where it did when the block was rendered whole.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`document.DEFAULT_AUTHORED_BLOCK`](../../../engine/src/live-docs/document.ts.mdmd.md#symbol-default_authored_block)
- [`GitHubSlugger`](../../../engine/src/tooling/githubSlugger.ts.mdmd.md#symbol-githubslugger)
- [`markdown.renderMarkdown`](./markdown.ts.mdmd.md#symbol-rendermarkdown)
- [`reader-sections.AuthoredSection`](./reader-sections.ts.mdmd.md#symbol-authoredsection)
- [`reader-sections.authoredSections`](./reader-sections.ts.mdmd.md#symbol-authoredsections)
- [`reader-sections.readerOrder`](./reader-sections.ts.mdmd.md#symbol-readerorder-function)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
