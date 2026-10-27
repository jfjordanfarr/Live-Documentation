# packages/engine/src/live-docs/adapters/html.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/adapters/html.ts
- Generated At: 2026-10-27T17:46:36.867Z

## Authored
### Purpose
Language adapter that extracts dependency relationships from HTML files by parsing elements that reference external resources (`<link>`, `<script>`, `<img>`, `<source>`, `<video>`, etc.), enabling HTML assets to display connectivity to their CSS, JS, image, font, and media dependencies in the Live Documentation Explorer.

### Notes
- Created 2025-12-09 to close the HTML asset visibility gap identified during 12/9.2 scoping
- Uses `findDocumentRoot()` to resolve server-root-relative paths (e.g., `/styles/site.css`) by walking up the directory tree and checking common static folders (`public/`, `wwwroot/`, `static/`, etc.)
- Handles srcset parsing with multiple URL entries for responsive images
- Skips external URLs (http/https), data URIs, protocol-relative URLs, and anchor-only references
- Strips query strings and fragments from URLs before resolution
- Unresolved URL paths keep their leading slash, so `/` remains a root reference and `/missing` remains distinct from `missing`; query-only references retain their written identity. T3's static-site examples exposed the former empty-specifier failure ([the investigation](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-27.1.record.md#turn-3)).
- Element IDs are public symbols so a consumer's `getElementById` link can land on the declared element.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `extractElementIds` {#symbol-extractelementids}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/html.ts#L318)

##### `extractElementIds` — Summary
Every element id in a markup file, sorted and unique. Shared with the ASP.NET
markup adapter so that a script's `getElementById` link lands on a symbol the
target doc actually publishes, whatever the markup dialect.

#### `htmlAdapter` {#symbol-htmladapter}
- Type: const
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/html.ts#L339)
- Returns: [`LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter)

##### `htmlAdapter` — Summary
Language adapter for HTML (`.html`, `.htm`). Extracts resource attributes such as `<script src>`, `<link href>` and `<img src>` as dependencies. Extracts element `id` attributes as public symbols.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `promises`, `statSync`
- `node:path` - `path`
- [`index.LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter) (type-only)
- [`core.DependencyEntry`](../core.ts.mdmd.md#symbol-dependencyentry) (type-only)
- [`core.SourceAnalysisResult`](../core.ts.mdmd.md#symbol-sourceanalysisresult) (type-only)
- [`pathUtils.normalizeWorkspacePath`](../../tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/polyglot-adapters.mdmd.md`](../../../../../../layer-3/polyglot-adapters.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
