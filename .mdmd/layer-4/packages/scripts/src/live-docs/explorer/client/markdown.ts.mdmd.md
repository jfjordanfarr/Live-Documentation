# packages/scripts/src/live-docs/explorer/client/markdown.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/markdown.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-markdown-ts
- Generated At: 2026-02-03T21:55:35.843Z

## Authored
### Purpose
Lightweight markdown renderer for the Live Docs Explorer detail panel. Handles headings, code blocks, links, lists, and inline formatting without a full CommonMark implementation.

### Notes
- Created 2025-12-07 as part of the Static Explorer client bundle
- Intentionally minimal: targets only patterns found in Live Documentation markdown
- `renderMarkdown()` is the main entry point; supports custom link handlers for relative path resolution

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:35.843Z","inputHash":"976dc25e42e7297b"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `renderMarkdown` {#symbol-rendermarkdown}
- Type: function
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/markdown.ts#L24)
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
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/markdown.ts#L131)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
