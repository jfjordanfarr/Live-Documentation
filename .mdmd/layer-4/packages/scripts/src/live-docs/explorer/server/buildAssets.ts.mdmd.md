# packages/scripts/src/live-docs/explorer/server/buildAssets.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/server/buildAssets.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-server-buildassets-ts
- Generated At: 2026-02-16T02:02:25.406Z

## Authored
### Purpose
Builds the Explorer's client-side assets (HTML, CSS, JavaScript) from the modular source files in `explorer/client/`. Emits bundled assets to a temporary directory for the HTTP server to serve.

### Notes
- Created 2025-11-21 during the explorer modularisation.
- Uses `esbuild` to bundle TypeScript client code into a single `bundle.js`.
- Injects the compiled CSS and JS into the `template.html` to produce the final `index.html`.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-16T02:02:25.406Z","inputHash":"e21d6f5b5be4fdb3"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `BuildExplorerAssetsOptions` {#symbol-buildexplorerassetsoptions}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/server/buildAssets.ts#L6)

#### `ExplorerAssets` {#symbol-explorerassets}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/server/buildAssets.ts#L10)

#### `buildExplorerAssets` {#symbol-buildexplorerassets}
- Type: function
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/server/buildAssets.ts#L20)
- Parameters: `_options`: [`BuildExplorerAssetsOptions`](#symbol-buildexplorerassetsoptions)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `esbuild` - `build`
- `fs/promises`
- `node:os`
- `path`
<!-- LIVE-DOC:END Dependencies -->
