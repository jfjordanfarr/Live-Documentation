# `packages/engine/src/tooling/markdownLinks.commonmark.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/engine/src/tooling/markdownLinks.commonmark.test.ts`
- Generated At: 2026-11-19T22:40:10.838Z

## Authored
### Purpose
The independent oracle for the markdown link rule ([markdownLinks.ts](markdownLinks.ts.mdmd.md)): every example of CommonMark 0.31.2's sections on backslash escapes, character references, link reference definitions, code spans, links, images, autolinks and raw HTML ([the excerpt](__fixtures__/commonmark-link-examples.json.mdmd.md)), 230 in all, must read as the reference renderer's HTML says, each `<a href>` and `<img src>` with its title, or be named with the reason this product reads it otherwise. A named example that starts to pass fails, so the list never outlives its reasons.

### Notes
- Written 2026-11-19 ([the probe](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/markdown-link-targets/README.md)), under the guide's rule that independent oracles are ground truth and nothing grades itself. The rule reads 229 of the 230; the one named is a definition in an indented code block, which the rule does not recognise. The three readers it replaced read 124 (the engine), 108 (the Explorer) and 131 (the link audit) by their destinations alone.
- Two steps belong to the reference renderer's HTML, not to how a link is read, and the test applies them to what the rule reads before comparing: commonmark.js's URL normalization (a valid percent-escape kept, unsafe characters percent-encoded) and HTML escaping. A tag that stands in an example's markdown as written is raw HTML passed through, not a link the renderer made.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `readFileSync`
- `node:path` - `path`
- [`markdownLinks.readMarkdownLinks`](./markdownLinks.ts.mdmd.md#symbol-readmarkdownlinks)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
