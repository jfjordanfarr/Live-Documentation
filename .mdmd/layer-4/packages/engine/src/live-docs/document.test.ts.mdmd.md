# `packages/engine/src/live-docs/document.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/engine/src/live-docs/document.test.ts`
- Generated At: 2026-11-22T07:12:52.832Z

## Authored
### Purpose
Proves the grammar: a doc using every production renders and parses back to the same model and the same text, the empty doc writes the placeholder lines the generator has always written, and each malformed input is refused with its line number.

### Notes
- Replaced `generator.test.ts` and `markdown.test.ts` on 2026-09-27, which had checked the old renderer's markers and provenance comment.
- The lenient `authoredBlockOf` is covered here too, including text with no sections at all.
- Since 2026-11-19 it shows the two forms of a value line by line, a code span or a link as before and a JSON string where that cannot carry the value (a code path with a line break, an empty command, a lone surrogate, a link with a parenthesis), refuses a quoted value the plain form could carry, and shows a docstring's heading, marker and unclosed fence written behind a backslash. `document.fuzz.test.ts` holds the same to generated names.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`document.DEFAULT_AUTHORED_BLOCK`](./document.ts.mdmd.md#symbol-default_authored_block)
- [`document.DocumentationReference`](./document.ts.mdmd.md#symbol-documentationreference) (type-only)
- [`document.LiveDoc`](./document.ts.mdmd.md#symbol-livedoc) (type-only)
- [`document.LiveDocSyntaxError`](./document.ts.mdmd.md#symbol-livedocsyntaxerror)
- [`document.authoredBlockOf`](./document.ts.mdmd.md#symbol-authoredblockof)
- [`document.documentationReferenceLine`](./document.ts.mdmd.md#symbol-documentationreferenceline)
- [`document.encodeLinkPath`](./document.ts.mdmd.md#symbol-encodelinkpath)
- [`document.parseLiveDoc`](./document.ts.mdmd.md#symbol-parselivedoc)
- [`document.readDocumentationReference`](./document.ts.mdmd.md#symbol-readdocumentationreference)
- [`document.renderLiveDoc`](./document.ts.mdmd.md#symbol-renderlivedoc)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
