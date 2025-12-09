# packages/shared/src/live-docs/adapters/html.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/live-docs/adapters/html.ts
- Live Doc ID: LD-implementation-packages-shared-src-live-docs-adapters-html-ts
- Generated At: 2025-12-09T17:30:00.834Z

## Authored
### Purpose
Language adapter that extracts dependency relationships from HTML files by parsing elements that reference external resources (`<link>`, `<script>`, `<img>`, `<source>`, `<video>`, etc.), enabling HTML assets to display connectivity to their CSS, JS, image, font, and media dependencies in the Live Documentation Explorer.

### Notes
- Created 2025-12-09 to close the HTML asset visibility gap identified during 12/9.2 scoping
- Uses `findDocumentRoot()` to resolve server-root-relative paths (e.g., `/styles/site.css`) by walking up the directory tree and checking common static folders (`public/`, `wwwroot/`, `static/`, etc.)
- Handles srcset parsing with multiple URL entries for responsive images
- Skips external URLs (http/https), data URIs, protocol-relative URLs, and anchor-only references
- Strips query strings and fragments from URLs before resolution
- Returns empty symbols array since HTML files have no TypeScript-style exports

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-09T17:30:00.834Z","inputHash":"513f9b870e2fdd7e"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `htmlAdapter` {#symbol-htmladapter}
- Type: const
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/html.ts#L301)
- Returns: [`LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter)
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
