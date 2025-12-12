# scripts/live-docs/visualize-explorer.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/live-docs/visualize-explorer.ts
- Live Doc ID: LD-implementation-scripts-live-docs-visualize-explorer-ts
- Generated At: 2025-12-12T16:10:25.911Z

## Authored
### Purpose
Serve as a sandbox CLI that snapshots the workspace graph and spins up a lightweight HTTP server for Gemini’s Live Docs visual explorer.

### Notes
- Generates induced/inheritance link data on the fly, writes it to `data/graph-snapshots/explorer-temp.json`, and renders multiple SVG views (circuit, map, force) inside a browser shell.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-12T16:10:25.911Z","inputHash":"1b6d19908148b86d"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/scripts` - `ExplorerServerInstance`, `ExplorerServerOptions`, `startExplorerServer` (type-only)
- `@live-documentation/shared/config/liveDocumentationConfig` - `DEFAULT_LIVE_DOCUMENTATION_CONFIG`, `LiveDocumentationConfigInput`, `normalizeLiveDocumentationConfig`
- `node:fs/promises` - `fs`
- `node:path` - `path`
<!-- LIVE-DOC:END Dependencies -->
