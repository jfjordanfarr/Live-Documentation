# packages/shared/src/live-docs/adapters/html.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/live-docs/adapters/html.ts
- Live Doc ID: LD-implementation-packages-shared-src-live-docs-adapters-html-ts
- Generated At: 2026-03-09T20:32:59.294Z

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
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-03-09T20:32:59.294Z","inputHash":"76af22ca65d8229d"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `htmlAdapter` {#symbol-htmladapter}
- Type: const
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/html.ts#L333)
- Returns: [`LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter)

##### `htmlAdapter` — Summary
Language adapter for HTML (`.html`, `.htm`). Extracts `<script src>`, `<link href>`, `<img src>`, and inline `<style>` references as dependencies. Extracts element `id` attributes as public symbols.
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

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [html.test.ts](./html.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
