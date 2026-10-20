# packages/explorer/src/client/markdown.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/markdown.test.ts
- Generated At: 2026-10-20T14:51:18.153Z

## Authored
### Purpose
Protects the reader's heading-anchor contract and separation of fenced code from document structure. Literal expected HTML and IDs verify that bundled section links can reach the heading they name.

### Notes
Originated in the [October 20 inspection work](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md#turn-2), when preserving a bundled-document fragment exposed the reader's incompatible slugging. The real configuration provenance link names `turn-19-config--schema-hardening-lines-3561-3760`; collapsing its two hyphens made the reader silently return to the document top.

Cases cover punctuation, duplicate names colliding with numbered names, independent render calls, Unicode, inline markup, custom link handlers and display-level clamping. Expectations are literal strings rather than values computed by the slugger under test.

Fenced-code cases require heading-like content to remain literal and leave real heading IDs available. They exercise shorter fences inside longer ones, tilde fences, longer closing delimiters, unclosed fences, indentation, escaped markup and links that must not invoke navigation. These are pure rendering checks; scrolling to a section through the actual reader is a browser responsibility.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`markdown.renderMarkdown`](./markdown.ts.mdmd.md#symbol-rendermarkdown)
- `vitest` - `describe`, `expect`, `it`, `vi`
<!-- LIVE-DOC:END Dependencies -->
