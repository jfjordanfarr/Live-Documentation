# packages/explorer/src/shared/buildAssets.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/shared/buildAssets.ts
- Generated At: 2026-10-19T17:42:51.306Z

## Authored
### Purpose

Build-time asset pipeline for the Live Docs Explorer. Bundles the client TypeScript entry point via esbuild, copies the CSS stylesheets into a temporary directory, and reads the HTML template while the static builder consumes them.

### Notes

- Created [2025-11-22](../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-24.SUMMARIZED.md) as `server/buildAssets.ts` during the initial Explorer server scaffolding (`f1e2dec0`).
- Relocated from `server/` to `shared/` on [2026-03-09](../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-09.1.md) during server retirement — this file was always a build-time utility, not server runtime code.
- `withExplorerAssets` owns the temporary directory for the whole build-and-consume call and removes it after compilation or output-writing success or failure. The output folder keeps the compiled copies, not the temporary workspace.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ExplorerAssets` {#symbol-explorerassets}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/shared/buildAssets.ts#L7)

##### `ExplorerAssets` — Summary
Paths and HTML template produced by the Explorer asset build step.

#### `withExplorerAssets` {#symbol-withexplorerassets}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/shared/buildAssets.ts#L21)
- Parameters: `assets`: [`ExplorerAssets`](#symbol-explorerassets)

##### `withExplorerAssets` — Summary
Builds the client assets in a temporary directory and keeps them available
only while the consumer writes its output. The directory is removed whether
building or consuming the assets succeeds or fails.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `esbuild` - `build`
- `fs/promises`
- `node:os`
- `path`
<!-- LIVE-DOC:END Dependencies -->
