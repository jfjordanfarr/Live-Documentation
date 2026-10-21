# packages/explorer/src/client/markdown.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/markdown.ts
- Generated At: 2026-10-21T01:48:35.041Z

## Authored
### Purpose
Renders authored Live Doc content and bundled Markdown in the Explorer's reader. Supplies a small set of block and inline forms, canonical ATX heading anchors, and a link-handler boundary so the reader can navigate bundled evidence without depending on a server.

### Notes
- Created for the [December 7, 2025 Static Explorer work](../../../../../../AI-Agent-Workspace/ChatHistory/2025/12/Summarized/2025-12-07.1.SUMMARIZED.md). In that session's Turn 7 the owner wanted Markdown rendering for authored content while keeping generated metadata and symbols in their terse structured presentation.
- The renderer remains a limited Markdown implementation. ATX headings use the engine's GitHub-compatible slugger and rendered-heading-text helper, with duplicate tracking reset for each document. This keeps punctuation, Unicode and inline formatting consistent with the anchors named by provenance links; it does not infer anchors from a custom link handler's HTML.
- Fenced code is consumed as an opaque block before heading or inline parsing. Matching delimiter and minimum closing length matter: code containing shorter fences or heading-like lines must not consume section IDs or invoke reader navigation. Unclosed fences remain code to the end of the input.
- `renderMarkdown()` accepts a custom link handler; target resolution and application state stay with the reader and its caller. The [October 20 inspection work](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md#turn-2) made bundled-document fragments explicit reader targets, exposing why their rendered heading IDs must match the canonical links.
- A doc's raw HTML is text (2026-10-21, [Turn 12 of the October 20 session](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md#turn-12)). Until then the renderer passed it through, so an `<img src="https://…">` in a doc made the page fetch from the internet and an `onerror` ran as script; no doc relied on raw HTML. Inline processing now finishes each link, autolink and code span first and holds it aside behind a private-use character, U+E000; one a doc writes is held first as its own character reference, so the doc keeps it and cannot forge a piece; the rest is escaped whole and only then emphasized. The same change ended three faults of the old order: a path in backticks showed its anchor's markup, underscores inside code became italics, and emphasis rewrote link attributes (`target="<em>blank"`). An underscore inside a word is a letter of it, as in CommonMark.
- An image's syntax is a link to the image, never fetched, and the default link handler keeps any scheme but the web and mail as text, so `javascript:` never becomes a link. The reader's own handler in `detailPanel.ts` makes the same refusal.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `renderMarkdown` {#symbol-rendermarkdown}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/markdown.ts#L30)
- Parameters: `options`: [`RenderMarkdownOptions`](#symbol-rendermarkdownoptions)

##### `renderMarkdown` — Summary
Render markdown to HTML.

##### `renderMarkdown` — Parameters
- `markdown`: The markdown content to render
- `options`: Rendering options

##### `renderMarkdown` — Returns
HTML string

#### `RenderMarkdownOptions` {#symbol-rendermarkdownoptions}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/markdown.ts#L155)

##### `RenderMarkdownOptions` — Summary
Options for the lightweight markdown-to-HTML renderer.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`GitHubSlugger`](../../../engine/src/tooling/githubSlugger.ts.mdmd.md#symbol-githubslugger)
- [`githubSlugger.slugText`](../../../engine/src/tooling/githubSlugger.ts.mdmd.md#symbol-slugtext)
- [`graph-helpers.escapeHtml`](./graph-helpers.ts.mdmd.md#symbol-escapehtml)
<!-- LIVE-DOC:END Dependencies -->
