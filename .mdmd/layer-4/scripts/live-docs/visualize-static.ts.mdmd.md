# scripts/live-docs/visualize-static.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/live-docs/visualize-static.ts
- Generated At: 2026-09-27T23:21:31.931Z

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
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs/promises`
- `node:path`
- [`staticBuilder.buildStaticExplorer`](../../packages/scripts/src/live-docs/explorer/shared/staticBuilder.ts.mdmd.md#symbol-buildstaticexplorer)
- [`liveDocumentationConfig.DEFAULT_LIVE_DOCUMENTATION_CONFIG`](../../packages/shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-default_live_documentation_config)
- [`liveDocumentationConfig.LiveDocumentationConfigInput`](../../packages/shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfiginput)
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../packages/shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
<!-- LIVE-DOC:END Dependencies -->
