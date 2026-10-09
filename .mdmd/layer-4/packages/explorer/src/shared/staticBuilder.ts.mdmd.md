# packages/explorer/src/shared/staticBuilder.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/shared/staticBuilder.ts
- Generated At: 2026-10-09T20:42:18.448Z

## Authored
### Purpose
Builds the static Explorer bundle: `explorer-data.json`, holding the graph index and the related markdown, the viewer page, and the scripts and styles.

### Notes
- Created 2025-12-07. Since 2026-09-28 it reads the graph index and no longer writes a symbol index, a provenance stamp, copies of the docs or precomputed Local Maps; the client derives what it needs from the graph.
- The related-markdown scanner reads doc text, so each file of the graph is rendered back to markdown for it, which gives the bytes the generator wrote.
- `buildAssets` is imported lazily to keep esbuild out of the module graph until it is needed.
- Since 2026-10-09 ([Turn 10 of the October 9 session](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-09.1.record.md#turn-10)) a bundle built with a board reads the graph through `readEstateGraph`, so the things the board names from folders scanned alone are merged into one graph before the bundle is written, and the viewer draws it as it draws any graph with a board; a board at the root of one scanned workspace reads as before. A fault in the board's text stops the build with its path and line.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `BuildStaticExplorerOptions` {#symbol-buildstaticexploreroptions}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/shared/staticBuilder.ts#L33)

##### `BuildStaticExplorerOptions` — Summary
Options controlling a static Explorer build.

#### `BuildStaticExplorerResult` {#symbol-buildstaticexplorerresult}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/shared/staticBuilder.ts#L54)

##### `BuildStaticExplorerResult` — Summary
Outcome of {@link buildStaticExplorer}, including file paths and size statistics.

#### `buildStaticExplorer` {#symbol-buildstaticexplorer}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/shared/staticBuilder.ts#L73)
- Parameters: `options`: [`BuildStaticExplorerOptions`](#symbol-buildstaticexploreroptions)

##### `buildStaticExplorer` — Summary
Build a complete static Explorer bundle.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `fs/promises`
- [`liveDocumentationConfig.DEFAULT_LIVE_DOCUMENTATION_CONFIG`](../../../engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-default_live_documentation_config)
- [`LiveDocumentationConfig`](../../../engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig)
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../../engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`board.parseBoard`](../../../engine/src/live-docs/board.ts.mdmd.md#symbol-parseboard)
- [`document.LiveDocSyntaxError`](../../../engine/src/live-docs/document.ts.mdmd.md#symbol-livedocsyntaxerror)
- [`document.renderLiveDoc`](../../../engine/src/live-docs/document.ts.mdmd.md#symbol-renderlivedoc)
- [`graphFiles.readEstateGraph`](../../../engine/src/live-docs/graphFiles.ts.mdmd.md#symbol-readestategraph)
- [`graphFiles.readLiveDocGraph`](../../../engine/src/live-docs/graphFiles.ts.mdmd.md#symbol-readlivedocgraph)
- [`bundledMarkdownScanner.scanAndBundleMarkdown`](./bundledMarkdownScanner.ts.mdmd.md#symbol-scanandbundlemarkdown)
- [`StaticExplorerData`](./staticExplorerData.ts.mdmd.md#symbol-staticexplorerdata) (type-only)
- `path`
<!-- LIVE-DOC:END Dependencies -->
