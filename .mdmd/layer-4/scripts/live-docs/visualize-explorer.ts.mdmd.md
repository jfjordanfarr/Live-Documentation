# scripts/live-docs/visualize-explorer.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/live-docs/visualize-explorer.ts
- Live Doc ID: LD-implementation-scripts-live-docs-visualize-explorer-ts
- Generated At: 2026-02-03T21:55:41.976Z

## Authored
### Purpose
Serve as a sandbox CLI that snapshots the workspace graph and spins up a lightweight HTTP server for Gemini’s Live Docs visual explorer.

### Notes
- Generates induced/inheritance link data on the fly, writes it to `data/graph-snapshots/explorer-temp.json`, and renders multiple SVG views (circuit, map, force) inside a browser shell.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:41.976Z","inputHash":"a46f7de9c1ab6764"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs/promises` - `fs`
- `node:path` - `path`
- [`index.ExplorerServerInstance`](../../packages/scripts/src/index.ts.mdmd.md#symbol-explorerserverinstance) (type-only)
- [`index.ExplorerServerOptions`](../../packages/scripts/src/index.ts.mdmd.md#symbol-explorerserveroptions) (type-only)
- [`index.startExplorerServer`](../../packages/scripts/src/index.ts.mdmd.md#symbol-startexplorerserver) (type-only)
- [`liveDocumentationConfig.DEFAULT_LIVE_DOCUMENTATION_CONFIG`](../../packages/shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-default_live_documentation_config)
- [`liveDocumentationConfig.LiveDocumentationConfigInput`](../../packages/shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfiginput)
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../packages/shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
<!-- LIVE-DOC:END Dependencies -->
