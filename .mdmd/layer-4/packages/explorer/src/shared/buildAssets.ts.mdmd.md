# packages/explorer/src/shared/buildAssets.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/shared/buildAssets.ts
- Generated At: 2026-10-22T16:47:56.674Z

## Authored
### Purpose

Build-time asset pipeline for the Live Docs Explorer. Bundles the client TypeScript entry point via esbuild, copies the CSS stylesheets into a temporary directory, and reads the HTML template while the static builder consumes them.

### Notes

- Created [2025-11-22](../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-24.SUMMARIZED.md) as `server/buildAssets.ts` during the initial Explorer server scaffolding (`f1e2dec0`).
- Relocated from `server/` to `shared/` on [2026-03-09](../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-09.1.md) during server retirement — this file was always a build-time utility, not server runtime code.
- `withExplorerAssets` owns the temporary directory for the whole build-and-consume call and removes it after compilation or output-writing success or failure. The output folder keeps the compiled copies, not the temporary workspace.
- Since 2026-11-12 the client is bundled as an immediately invoked function, a classic script, where it was an ES module: a browser refuses a module script to a page opened as a file, so the page could not even say it must be served, and sat at "Loading..." ([the first-visit evaluation](../../../../../../AI-Agent-Workspace/Screenshots/2026-11-12/first-visit/README.md), finding 2). esbuild starts the bundle with `"use strict"`, so the code keeps the strict semantics it had as a module, and the wrapper keeps its declarations out of the page's globals. The client imports nothing at run time and uses no `import.meta`, which a classic script would lack.

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

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
