# packages/explorer/src/client/markdown.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/markdown.ts
- Generated At: 2026-10-08T16:03:27.769Z

## Authored
### Purpose
Lightweight markdown renderer for the Live Docs Explorer detail panel. Handles headings, code blocks, links, lists, and inline formatting without a full CommonMark implementation.

### Notes
- Created 2025-12-07 as part of the Static Explorer client bundle
- Intentionally minimal: targets only patterns found in Live Documentation markdown
- `renderMarkdown()` is the main entry point; supports custom link handlers for relative path resolution

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `renderMarkdown` {#symbol-rendermarkdown}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/markdown.ts#L26)
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
- Source: [source](../../../../../../packages/explorer/src/client/markdown.ts#L134)

##### `RenderMarkdownOptions` — Summary
Options for the lightweight markdown-to-HTML renderer.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`graph-helpers.escapeHtml`](./graph-helpers.ts.mdmd.md#symbol-escapehtml)
<!-- LIVE-DOC:END Dependencies -->
