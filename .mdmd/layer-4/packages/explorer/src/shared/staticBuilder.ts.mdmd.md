# packages/explorer/src/shared/staticBuilder.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/shared/staticBuilder.ts
- Generated At: 2026-10-22T17:22:34.490Z

## Authored
### Purpose
Builds the static Explorer bundle: `explorer-data.json`, holding the graph index and the related markdown, the viewer page, and the scripts and styles.

### Notes
- Created 2025-12-07. Since 2026-09-28 it reads the graph index and no longer writes a symbol index, a provenance stamp, copies of the docs or precomputed Local Maps; the client derives what it needs from the graph.
- Since 2026-10-20 ([Turn 9](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md#turn-9)) the related documents come from `relatedDocsOf` over the graph's authored blocks, the rule the history reads at every past commit; before, each file of the graph was rendered back to markdown for a scanner to read.
- `buildAssets` is imported lazily to keep esbuild out of the module graph until it is needed.
- The asset builder keeps its temporary directory only while this builder copies the compiled files into the output folder; its cleanup runs even when compilation or the copy fails.
- Since 2026-10-09 ([Turn 10 of the October 9 session](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-09.1.record.md#turn-10)) a bundle built with a board reads the graph through `readEstateGraph`, so the things the board names from folders scanned alone are merged into one graph before the bundle is written, and the viewer draws it as it draws any graph with a board; a board at the root of one scanned workspace reads as before. A fault in the board's text stops the build with its path and line.
- Since 2026-10-15 the bundle carries the configuration's `sampleRoots` when any are set; the client reads product facts from the bundle, never from a path convention.
- Since 2026-10-17 (C1 of [the plan](../../../../../../.mdmd/layer-3/change-over-time.mdmd.md)) the bundle carries the history the exporter asks for as `explorer-history.json` beside the data, a window re-based on its first commit, and says so in the data's `history` field: by default all of it when `<root>/history/history.json` exists and none otherwise, and a build that carries none removes a history an earlier build left. The history is a file apart so that the client fetches it only when the history is opened, and a page without it is no slower.
- Since 2026-10-22 ([the decision](../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#related-documents-run-both-ways-a-docs-cited-by-section-is-generated-from-the-documents-own-links-recorded-2026-10-22)) the links carry both directions: `relatedDocsOf` over each doc's authored words for what the file cites, and each doc's `Cited By` section, resolved from the doc's place, for what cites it; the bundle then carries every document either names. On this repository that is 78 documents against 63.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ExportedHistory` {#symbol-exportedhistory}
- Type: type
- Source: [source](../../../../../../packages/explorer/src/shared/staticBuilder.ts#L39)
- Returns: [`HistorySelection`](../../../engine/src/live-docs/history/window.ts.mdmd.md#symbol-historyselection)

##### `ExportedHistory` — Summary
How much of the history an export carries: none of it, or the part a selection names.

#### `BuildStaticExplorerOptions` {#symbol-buildstaticexploreroptions}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/shared/staticBuilder.ts#L45)

##### `BuildStaticExplorerOptions` — Summary
Options controlling a static Explorer build.

#### `BuildStaticExplorerResult` {#symbol-buildstaticexplorerresult}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/shared/staticBuilder.ts#L73)

##### `BuildStaticExplorerResult` — Summary
Outcome of {@link buildStaticExplorer}, including file paths and size statistics.

#### `buildStaticExplorer` {#symbol-buildstaticexplorer}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/shared/staticBuilder.ts#L94)
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
- [`graph.resolveDocLink`](../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-resolvedoclink)
- [`graphFiles.readEstateGraph`](../../../engine/src/live-docs/graphFiles.ts.mdmd.md#symbol-readestategraph)
- [`graphFiles.readLiveDocGraph`](../../../engine/src/live-docs/graphFiles.ts.mdmd.md#symbol-readlivedocgraph)
- [`format.HISTORY_DIRECTORY`](../../../engine/src/live-docs/history/format.ts.mdmd.md#symbol-history_directory)
- [`format.HISTORY_FILE`](../../../engine/src/live-docs/history/format.ts.mdmd.md#symbol-history_file)
- [`format.HISTORY_FORMAT`](../../../engine/src/live-docs/history/format.ts.mdmd.md#symbol-history_format)
- [`format.HistorySequence`](../../../engine/src/live-docs/history/format.ts.mdmd.md#symbol-historysequence)
- [`sequence.headOf`](../../../engine/src/live-docs/history/sequence.ts.mdmd.md#symbol-headof)
- [`window.HistorySelection`](../../../engine/src/live-docs/history/window.ts.mdmd.md#symbol-historyselection)
- [`window.windowOf`](../../../engine/src/live-docs/history/window.ts.mdmd.md#symbol-windowof)
- [`relatedDocs.relatedDocsOf`](../../../engine/src/live-docs/relatedDocs.ts.mdmd.md#symbol-relateddocsof)
- [`buildAssets`](./buildAssets.ts.mdmd.md)
- [`bundledMarkdownScanner.bundleRelatedDocs`](./bundledMarkdownScanner.ts.mdmd.md#symbol-bundlerelateddocs)
- [`StaticExplorerData`](./staticExplorerData.ts.mdmd.md#symbol-staticexplorerdata) (type-only)
- `path`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../../../layer-3/architectural-decisions.mdmd.md)
- [`.mdmd/layer-3/change-over-time.mdmd.md`](../../../../../layer-3/change-over-time.mdmd.md)
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
