# packages/engine/src/tooling/markdownLinks.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/engine/src/tooling/markdownLinks.test.ts
- Generated At: 2026-11-19T20:14:11.661Z

## Authored
### Purpose
Holds the markdown link rule ([markdownLinks.ts](markdownLinks.ts.mdmd.md)) to what CommonMark's examples do not reach: which blocks decide whether a link is one (fences, paragraphs across lines, headings, list items, block quotes), a document with CRLF line endings, the places the rule differs from the specification on purpose, offsets into the document, references and the labels no definition names, the tokens the Explorer renders, and how a destination becomes a path.

### Notes
- Written 2026-11-19 with the rule ([the probe](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/markdown-link-targets/README.md)). Its first run found that a continuation line's indentation and a CRLF's carriage return reached a multi-line title; the rule now maps offsets back through the line endings and strips a continuation line's leading space, as CommonMark's paragraphs do.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`htmlEntities.namedCharacterReference`](./htmlEntities.ts.mdmd.md#symbol-namedcharacterreference)
- [`markdownLinks.inlineTokens`](./markdownLinks.ts.mdmd.md#symbol-inlinetokens)
- [`markdownLinks.linkPath`](./markdownLinks.ts.mdmd.md#symbol-linkpath)
- [`markdownLinks.readMarkdownLinks`](./markdownLinks.ts.mdmd.md#symbol-readmarkdownlinks)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
