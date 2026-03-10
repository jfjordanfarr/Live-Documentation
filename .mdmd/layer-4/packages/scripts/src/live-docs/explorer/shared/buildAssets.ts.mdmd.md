# packages/scripts/src/live-docs/explorer/shared/buildAssets.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/shared/buildAssets.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-shared-buildassets-ts
- Generated At: 2026-03-09T21:20:32.438Z

## Authored
### Purpose

Build-time asset pipeline for the Live Docs Explorer. Bundles the client TypeScript entry point via esbuild, copies all CSS stylesheets into a temporary output directory, and reads the HTML template — producing the complete `ExplorerAssets` payload consumed by the static builder.

### Notes

- Created [2025-11-22](../../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-24.SUMMARIZED.md) as `server/buildAssets.ts` during the initial Explorer server scaffolding (`f1e2dec0`).
- Relocated from `server/` to `shared/` on [2026-03-09](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-09.1.md) during server retirement — this file was always a build-time utility, not server runtime code.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-03-09T21:20:32.438Z","inputHash":"15fa8597ad5ef79f"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ExplorerAssets` {#symbol-explorerassets}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/buildAssets.ts#L7)

##### `ExplorerAssets` — Summary
Paths and HTML template produced by the Explorer asset build step.

#### `buildExplorerAssets` {#symbol-buildexplorerassets}
- Type: function
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/buildAssets.ts#L20)

##### `buildExplorerAssets` — Summary
Bundles the Explorer client TypeScript + CSS into a temporary directory
and returns the output paths and HTML template.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `esbuild` - `build`
- `fs/promises`
- `node:os`
- `path`
<!-- LIVE-DOC:END Dependencies -->
