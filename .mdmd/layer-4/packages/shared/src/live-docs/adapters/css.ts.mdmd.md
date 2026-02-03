# packages/shared/src/live-docs/adapters/css.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/live-docs/adapters/css.ts
- Live Doc ID: LD-implementation-packages-shared-src-live-docs-adapters-css-ts
- Generated At: 2026-02-03T21:55:39.783Z

## Authored
### Purpose
Language adapter that extracts dependency relationships from CSS files by parsing `@import` rules, `url()` references, and `@font-face src` declarations, enabling CSS assets to display connectivity to their font, image, and nested stylesheet dependencies in the Live Documentation Explorer.

### Notes
- Created 2025-12-09 alongside the HTML adapter to provide full web asset graph coverage
- Uses `findDocumentRoot()` to resolve server-root-relative paths (same algorithm as HTML adapter)
- Handles both quoted and bare (unquoted) `url()` syntax
- Deduplicates repeated references to the same resource across different quote styles
- Strips query strings and fragments from URLs (e.g., cache-busting `?v=123` suffixes)
- Returns empty symbols array since CSS files have no TypeScript-style exports

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:39.783Z","inputHash":"fda170c4b7976076"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `cssAdapter` {#symbol-cssadapter}
- Type: const
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/css.ts#L295)
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

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [css.test.ts](./css.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
