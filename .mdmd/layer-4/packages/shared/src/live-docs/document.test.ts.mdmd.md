# packages/shared/src/live-docs/document.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/shared/src/live-docs/document.test.ts
- Generated At: 2026-09-27T23:21:31.440Z

## Authored
### Purpose
Proves the grammar: a doc using every production renders and parses back to the same model and the same text, the empty doc writes the placeholder lines the generator has always written, and each malformed input is refused with its line number.

### Notes
- Replaced `generator.test.ts` and `markdown.test.ts` on 2026-09-27, which had checked the old renderer's markers and provenance comment.
- The lenient `authoredBlockOf` is covered here too, including text with no sections at all.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`document.DEFAULT_AUTHORED_BLOCK`](./document.ts.mdmd.md#symbol-default_authored_block)
- [`document.LiveDoc`](./document.ts.mdmd.md#symbol-livedoc)
- [`document.LiveDocSyntaxError`](./document.ts.mdmd.md#symbol-livedocsyntaxerror)
- [`document.authoredBlockOf`](./document.ts.mdmd.md#symbol-authoredblockof)
- [`document.parseLiveDoc`](./document.ts.mdmd.md#symbol-parselivedoc)
- [`document.renderLiveDoc`](./document.ts.mdmd.md#symbol-renderlivedoc)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
