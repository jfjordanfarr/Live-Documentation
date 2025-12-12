# scripts/live-docs/visualize-static.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/live-docs/visualize-static.ts
- Live Doc ID: LD-implementation-scripts-live-docs-visualize-static-ts
- Generated At: 2025-12-12T16:10:25.929Z

## Authored
### Purpose
CLI entry point for generating fully static Live Documentation Explorer bundles. Enables offline viewing, GitHub Pages deployment, and embedding in documentation portals (Teams, Slack, wikis) without requiring a running server.

### Notes
- Created 2025-12-07 during the Static Explorer feature development
- Accepts `--output <dir>` (default `dist/explorer/`) and `--clean` flags
- Delegates actual bundle generation to `staticBuilder.buildStaticExplorer()`
- Outputs byte counts for each generated file to provide build feedback
- Invoked via `npm run live-docs:visualize:static`

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-12T16:10:25.929Z","inputHash":"3cabd7d24bdf1c96"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/scripts/live-docs/explorer/shared/staticBuilder` - `buildStaticExplorer`
- `@live-documentation/shared/config/liveDocumentationConfig` - `DEFAULT_LIVE_DOCUMENTATION_CONFIG`, `LiveDocumentationConfigInput`, `normalizeLiveDocumentationConfig`
- `node:fs/promises` - `fs`
- `node:path` - `path`
<!-- LIVE-DOC:END Dependencies -->
