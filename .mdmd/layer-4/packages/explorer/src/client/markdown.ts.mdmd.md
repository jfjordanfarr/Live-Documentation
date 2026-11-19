# packages/explorer/src/client/markdown.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/markdown.ts
- Generated At: 2026-11-19T20:14:12.241Z

## Authored
### Purpose
Renders authored Live Doc content and bundled Markdown in the Explorer's reader. Supplies a small set of block and inline forms, canonical ATX heading anchors, and a link-handler boundary so the reader can navigate bundled evidence without depending on a server.

### Notes
- Created for the [December 7, 2025 Static Explorer work](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2025/12/Summarized/2025-12-07.1.SUMMARIZED.md). In that session's Turn 7 the owner wanted Markdown rendering for authored content while keeping generated metadata and symbols in their terse structured presentation.
- The renderer remains a limited Markdown implementation. ATX headings use the engine's GitHub-compatible slugger and rendered-heading-text helper, with duplicate tracking reset for each document. This keeps punctuation, Unicode and inline formatting consistent with the anchors named by provenance links; it does not infer anchors from a custom link handler's HTML.
- Fenced code is consumed as an opaque block before heading or inline parsing. Matching delimiter and minimum closing length matter: code containing shorter fences or heading-like lines must not consume section IDs or invoke reader navigation. Unclosed fences remain code to the end of the input.
- `renderMarkdown()` accepts a custom link handler; target resolution and application state stay with the reader and its caller. The [October 20 inspection work](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-20/2026-10-20.1.record.md#turn-2) made bundled-document fragments explicit reader targets, exposing why their rendered heading IDs must match the canonical links.
- A doc's raw HTML is text (2026-10-21, [Turn 12 of the October 20 session](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-20/2026-10-20.1.record.md#turn-12)). Until then the renderer passed it through, so an `<img src="https://…">` in a doc made the page fetch from the internet and an `onerror` ran as script; no doc relied on raw HTML. Inline processing now finishes each link, autolink and code span first and holds it aside behind a private-use character, U+E000; one a doc writes is held first as its own character reference, so the doc keeps it and cannot forge a piece; the rest is escaped whole and only then emphasized. The same change ended three faults of the old order: a path in backticks showed its anchor's markup, underscores inside code became italics, and emphasis rewrote link attributes (`target="<em>blank"`). An underscore inside a word is a letter of it, as in CommonMark.
- An image's syntax is a link to the image, never fetched, and the default link handler keeps any scheme but the web and mail as text, so `javascript:` never becomes a link. The reader's own handler in `detailPanel.ts` makes the same refusal.
- `fenceClosing` and `headingOf` (2026-10-30) are the renderer's own rules for a fence and a heading, exported so that [reader-sections.ts](reader-sections.ts.mdmd.md), which cuts a doc's authored block at its headings, agrees with the renderer on what is fenced and what is a heading. The `slugger` option lets the reader render the block section by section with one slugger, so each heading keeps the id it has when the block is rendered whole.

November 4 joins soft source line wraps into one paragraph while keeping blank paragraphs, lists, headings and fenced code distinct. The native long-symbol reading test exposed the former per-line paragraphs; the correction applies consistently to both reading surfaces and preserves the raw-HTML-as-text policy. See the [integration record](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-04/2026-11-04.1.record.md#turn-2).

November 19 reads inline text by CommonMark's rule, the one the engine counts a doc's links by ([markdownLinks.ts](../../../engine/src/tooling/markdownLinks.ts.mdmd.md); [the probe, with matched pictures](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/markdown-link-targets/README.md)). The renderer's pattern ended a link's target at its first `)`, so a link the engine counted, `plan%20(draft).md` or `app/(auth)/notes.md`, was dead text followed by debris such as `.md)`. Every link, autolink, code span, backslash escape, character reference and piece of raw HTML is now a token of the rule, held aside as before: an escaped character is shown as itself, so a docstring line the Live Doc writes behind a backslash (``\#### `notes` ``) no longer shows the backslash, and `&copy;` shows `©`. Raw HTML stays text, an autolink to any scheme but the web and mail stays text as written, and a bare relative path in prose is still linked. The browser case is [link-targets.spec.ts](../../../../tests/e2e/link-targets.spec.ts.mdmd.md).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `renderMarkdown` {#symbol-rendermarkdown}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/markdown.ts#L34)
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
- Source: [source](../../../../../../packages/explorer/src/client/markdown.ts#L166)

##### `RenderMarkdownOptions` — Summary
Options for the lightweight markdown-to-HTML renderer.

#### `fenceClosing` {#symbol-fenceclosing}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/markdown.ts#L190)

##### `fenceClosing` — Summary
The line that closes the fence a line opens, or null when the line opens none. A backtick fence whose info string
holds a backtick is not one. Any reader that splits a document must agree with the renderer on what is fenced.

#### `headingOf` {#symbol-headingof}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/markdown.ts#L197)

##### `headingOf` — Summary
A heading line's level and its text without closing hashes, or null when the line is not a heading.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`GitHubSlugger`](../../../engine/src/tooling/githubSlugger.ts.mdmd.md#symbol-githubslugger)
- [`githubSlugger.slugText`](../../../engine/src/tooling/githubSlugger.ts.mdmd.md#symbol-slugtext)
- [`markdownLinks.InlineToken`](../../../engine/src/tooling/markdownLinks.ts.mdmd.md#symbol-inlinetoken)
- [`markdownLinks.inlineTokens`](../../../engine/src/tooling/markdownLinks.ts.mdmd.md#symbol-inlinetokens)
- [`graph-helpers.escapeHtml`](./graph-helpers.ts.mdmd.md#symbol-escapehtml)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../../../layer-3/architectural-decisions.mdmd.md)
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
