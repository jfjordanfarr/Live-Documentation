# packages/generator/src/generator.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/generator/src/generator.ts
- Entry: module of [`packages/generator/package.json`](../package.json.mdmd.md)
- Generated At: 2026-10-22T00:54:20.016Z

## Authored
### Purpose
Coordinates Live Documentation generation: analyzes source files, carries authored sections forward, writes deterministic markdown mirrors, prunes stale docs, and writes the graph index after every run.

### Notes
- After the docs are written, every doc on disk is read back through the grammar and the graph derived from them is written to `<root>/index.json` (since 2026-09-28). A preserved orphan the grammar refuses fails that step with its path and line; the docs already written stay written. A dry run writes nothing, the index included.
- A doc is rewritten only when its rendered text differs from what is on disk, and only then does its `Generated At` line move.
- Since 2026-10-09 ([Turn 10 of the October 9 session](../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-09.1.record.md#turn-10)) a run warns when the folder lies inside a scan, a docs root or a configuration file of this tool above it, and when a scan lies inside the folder, found by one walk for the docs root's and the configuration file's names below it; a scan never lies inside another scan, the owner's rule for the World Map, and the warning says to point at one of them. It warns and does not refuse, since the generator cannot know whether the other scan is current or abandoned.
- Since 2026-10-15 ([Turn 4](../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-15.1.record.md#turn-4)) the first pass builds the entry index beside the symbol index, and `composeGenerated` writes each doc's `Entry` lines from the file's own analysis, the index, its symbol kinds, the tooling rule and the configuration's `entryPoints`, before the three sections.
- Since 2026-10-19, `--changed` and `--include` build file, symbol and entry indexes from the discovered workspace even when they render a subset, so links from a selected doc to an unselected source remain available. Changed-only pruning checks just changed source paths, including rename origins, and preserves authored orphans. It does not invalidate unchanged consumers of a changed provider; full generation refreshes them.
- The stale-doc pruner owns its two filesystem helpers. `directoryExists` treats a stat failure as absence; `cleanupEmptyParents` removes empty parents after a doc deletion up to, but not including, the base-layer root, and stops on a nonempty folder or filesystem error. They were extracted into an engine `fileUtils.ts` during [the December 6 refactor](../../../../../AI-Agent-Workspace/ChatHistory/2025/12/Summarized/2025-12-06.3.SUMMARIZED.md) and returned to their only caller on 2026-10-19; no analysis or doc-format behavior changed.
- `keepAuthoredStaleDocs` (2026-10-20, [Turn 9](../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md#turn-9)) decides whether a stale doc with authored words is kept: true for a person's workspace, so no written words vanish unread; false for the history's lens, so that a past commit's mirror regenerated in place gives exactly the files this run documents.
- Since 2026-10-22 ([Turn 8 of the October 21 session](../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-21.1.record.md#turn-8)) a new doc of a file no reader handles (`noReaderHandles`: no reader by name or extension, and not an image, a font or a recording) starts with `UNREAD_AUTHORED_BLOCK`, whose Notes say so in place of `_Pending notes_`. The note is written once, when the doc is made; from then on it is the author's to keep or revise, and a doc holding nothing but it is pruned with its file like one holding the pending placeholders.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LiveDocGeneratorResult` {#symbol-livedocgeneratorresult}
- Type: interface
- Source: [source](../../../../../packages/generator/src/generator.ts#L56)

##### `LiveDocGeneratorResult` — Summary
Summary returned by {@link generateLiveDocs} after processing all target files.

The caller uses `written` and `deleted` counts for progress reporting, while
the `files` array gives per-file detail for dry-run previews and CI checks.

#### `generateLiveDocs` {#symbol-generatelivedocs}
- Type: function
- Source: [source](../../../../../packages/generator/src/generator.ts#L102)
- Parameters: `options`: `GenerateLiveDocsOptions`

##### `generateLiveDocs` — Summary
Entry point for the Live Documentation generation pipeline.

Discovers all workspace files matching the configured globs, analyses each for
public symbols and dependencies, and renders deterministic markdown docs under
the configured base layer directory. A doc is rewritten only when its generated
content changed, and only then does its `Generated At` line move. After a run
that writes, the graph index is derived from every doc on disk and written to
`<root>/index.json`.

Supports `--dry-run` (no writes), `--changed` (process git-dirty sources
against full workspace context), and `--include` (explicit file subset)
modes. Stale Live Docs whose sources no longer exist are pruned; a
changed-only run restricts pruning to changed source paths.

Created 2025-11-09; extended with symbol index (2026-01-14), JSON adapter
(2026-01-28), cross-platform hash fix (2026-02-03) and the entry index
behind the `Entry` lines (2026-10-15).

##### `generateLiveDocs` — Parameters
- `options`: Generation configuration including workspace root, config overrides, and logger.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `glob` - `glob`
- `node:fs/promises`
- `node:path` - `path`
- [`LiveDocumentationConfig`](../../engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig)
- [`liveDocumentationConfig.noReaderHandles`](../../engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-noreaderhandles)
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`core.BINARY_SNIFF_BYTES`](../../engine/src/live-docs/core.ts.mdmd.md#symbol-binary_sniff_bytes)
- [`core.SourceAnalysisResult`](../../engine/src/live-docs/core.ts.mdmd.md#symbol-sourceanalysisresult)
- [`core.WorkspaceEntryIndex`](../../engine/src/live-docs/core.ts.mdmd.md#symbol-workspaceentryindex)
- [`core.WorkspaceFileIndex`](../../engine/src/live-docs/core.ts.mdmd.md#symbol-workspacefileindex)
- [`core.WorkspaceSymbolIndex`](../../engine/src/live-docs/core.ts.mdmd.md#symbol-workspacesymbolindex)
- [`core.analyzeSourceFile`](../../engine/src/live-docs/core.ts.mdmd.md#symbol-analyzesourcefile)
- [`core.buildWorkspaceIndexes`](../../engine/src/live-docs/core.ts.mdmd.md#symbol-buildworkspaceindexes)
- [`core.composeDependencies`](../../engine/src/live-docs/core.ts.mdmd.md#symbol-composedependencies)
- [`core.composeEntries`](../../engine/src/live-docs/core.ts.mdmd.md#symbol-composeentries)
- [`core.composeReExports`](../../engine/src/live-docs/core.ts.mdmd.md#symbol-composereexports)
- [`core.composeSymbolBlocks`](../../engine/src/live-docs/core.ts.mdmd.md#symbol-composesymbolblocks)
- [`core.computePublicSymbolHeadingInfo`](../../engine/src/live-docs/core.ts.mdmd.md#symbol-computepublicsymbolheadinginfo)
- [`core.discoverTargetFiles`](../../engine/src/live-docs/core.ts.mdmd.md#symbol-discovertargetfiles)
- [`core.hasMeaningfulAuthoredContent`](../../engine/src/live-docs/core.ts.mdmd.md#symbol-hasmeaningfulauthoredcontent)
- [`core.isBinaryContent`](../../engine/src/live-docs/core.ts.mdmd.md#symbol-isbinarycontent)
- [`core.resolveArchetype`](../../engine/src/live-docs/core.ts.mdmd.md#symbol-resolvearchetype)
- [`document.DEFAULT_AUTHORED_BLOCK`](../../engine/src/live-docs/document.ts.mdmd.md#symbol-default_authored_block)
- [`document.LiveDoc`](../../engine/src/live-docs/document.ts.mdmd.md#symbol-livedoc)
- [`document.LiveDocSyntaxError`](../../engine/src/live-docs/document.ts.mdmd.md#symbol-livedocsyntaxerror)
- [`document.UNREAD_AUTHORED_BLOCK`](../../engine/src/live-docs/document.ts.mdmd.md#symbol-unread_authored_block)
- [`document.authoredBlockOf`](../../engine/src/live-docs/document.ts.mdmd.md#symbol-authoredblockof)
- [`document.parseLiveDoc`](../../engine/src/live-docs/document.ts.mdmd.md#symbol-parselivedoc)
- [`document.renderLiveDoc`](../../engine/src/live-docs/document.ts.mdmd.md#symbol-renderlivedoc)
- [`gitUtils.detectChangedFiles`](../../engine/src/live-docs/gitUtils.ts.mdmd.md#symbol-detectchangedfiles)
- [`graphFiles.readLiveDocGraph`](../../engine/src/live-docs/graphFiles.ts.mdmd.md#symbol-readlivedocgraph)
- [`graphFiles.writeLiveDocGraph`](../../engine/src/live-docs/graphFiles.ts.mdmd.md#symbol-writelivedocgraph)
- [`pathUtils.normalizeWorkspacePath`](../../engine/src/tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
- [`pathUtils.toWorkspaceFileUri`](../../engine/src/tooling/pathUtils.ts.mdmd.md#symbol-toworkspacefileuri)
- [`pathUtils.toWorkspaceRelativePath`](../../engine/src/tooling/pathUtils.ts.mdmd.md#symbol-toworkspacerelativepath)
<!-- LIVE-DOC:END Dependencies -->
