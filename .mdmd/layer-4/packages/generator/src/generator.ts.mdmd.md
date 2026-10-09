# packages/generator/src/generator.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/generator/src/generator.ts
- Generated At: 2026-09-28T01:00:41.558Z

## Authored
### Purpose
Coordinates Live Documentation generation: analyzes source files, carries authored sections forward, writes deterministic markdown mirrors, prunes stale docs, and writes the graph index after every run.

### Notes
- After the docs are written, every doc on disk is read back through the grammar and the graph derived from them is written to `<root>/index.json` (since 2026-09-28). A preserved orphan the grammar refuses fails that step with its path and line; the docs already written stay written. A dry run writes nothing, the index included.
- A doc is rewritten only when its rendered text differs from what is on disk, and only then does its `Generated At` line move.
- Since 2026-10-09 ([Turn 10 of the October 9 session](../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-09.1.record.md#turn-10)) a run warns when the folder lies inside a scan, a docs root or a configuration file of this tool above it, and when a scan lies inside the folder, found by one walk for the docs root's and the configuration file's names below it; a scan never lies inside another scan, the owner's rule for the World Map, and the warning says to point at one of them. It warns and does not refuse, since the generator cannot know whether the other scan is current or abandoned.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LiveDocGeneratorResult` {#symbol-livedocgeneratorresult}
- Type: interface
- Source: [source](../../../../../packages/generator/src/generator.ts#L61)

##### `LiveDocGeneratorResult` — Summary
Summary returned by {@link generateLiveDocs} after processing all target files.

The caller uses `written` and `deleted` counts for progress reporting, while
the `files` array gives per-file detail for dry-run previews and CI checks.

#### `generateLiveDocs` {#symbol-generatelivedocs}
- Type: function
- Source: [source](../../../../../packages/generator/src/generator.ts#L105)
- Parameters: `options`: `GenerateLiveDocsOptions`

##### `generateLiveDocs` — Summary
Entry point for the Live Documentation generation pipeline.

Discovers all workspace files matching the configured globs, analyses each for
public symbols and dependencies, and renders deterministic markdown docs under
the configured base layer directory. A doc is rewritten only when its generated
content changed, and only then does its `Generated At` line move. After a run
that writes, the graph index is derived from every doc on disk and written to
`<root>/index.json`.

Supports `--dry-run` (no writes), `--changed` (process only git-dirty files),
and `--include` (explicit file subset) modes. Stale Live Docs whose source
files no longer exist are pruned automatically (unless `changedOnly` is set).

Created 2025-11-09; extended with symbol index (2026-01-14), JSON adapter
(2026-01-28), and cross-platform hash fix (2026-02-03).

##### `generateLiveDocs` — Parameters
- `options`: Generation configuration including workspace root, config overrides, and logger.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `glob` - `glob`
- `node:fs/promises`
- `node:path` - `path`
- [`LiveDocumentationConfig`](../../engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig)
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`core.SourceAnalysisResult`](../../engine/src/live-docs/core.ts.mdmd.md#symbol-sourceanalysisresult)
- [`core.WorkspaceFileIndex`](../../engine/src/live-docs/core.ts.mdmd.md#symbol-workspacefileindex)
- [`core.WorkspaceSymbolIndex`](../../engine/src/live-docs/core.ts.mdmd.md#symbol-workspacesymbolindex)
- [`core.analyzeSourceFile`](../../engine/src/live-docs/core.ts.mdmd.md#symbol-analyzesourcefile)
- [`core.buildWorkspaceSymbolIndex`](../../engine/src/live-docs/core.ts.mdmd.md#symbol-buildworkspacesymbolindex)
- [`core.cleanupEmptyParents`](../../engine/src/live-docs/core.ts.mdmd.md#symbol-cleanupemptyparents)
- [`core.composeDependencies`](../../engine/src/live-docs/core.ts.mdmd.md#symbol-composedependencies)
- [`core.composeReExports`](../../engine/src/live-docs/core.ts.mdmd.md#symbol-composereexports)
- [`core.composeSymbolBlocks`](../../engine/src/live-docs/core.ts.mdmd.md#symbol-composesymbolblocks)
- [`core.computePublicSymbolHeadingInfo`](../../engine/src/live-docs/core.ts.mdmd.md#symbol-computepublicsymbolheadinginfo)
- [`core.directoryExists`](../../engine/src/live-docs/core.ts.mdmd.md#symbol-directoryexists)
- [`core.discoverTargetFiles`](../../engine/src/live-docs/core.ts.mdmd.md#symbol-discovertargetfiles)
- [`core.hasMeaningfulAuthoredContent`](../../engine/src/live-docs/core.ts.mdmd.md#symbol-hasmeaningfulauthoredcontent)
- [`core.resolveArchetype`](../../engine/src/live-docs/core.ts.mdmd.md#symbol-resolvearchetype)
- [`document.LiveDoc`](../../engine/src/live-docs/document.ts.mdmd.md#symbol-livedoc)
- [`document.LiveDocSyntaxError`](../../engine/src/live-docs/document.ts.mdmd.md#symbol-livedocsyntaxerror)
- [`document.authoredBlockOf`](../../engine/src/live-docs/document.ts.mdmd.md#symbol-authoredblockof)
- [`document.parseLiveDoc`](../../engine/src/live-docs/document.ts.mdmd.md#symbol-parselivedoc)
- [`document.renderLiveDoc`](../../engine/src/live-docs/document.ts.mdmd.md#symbol-renderlivedoc)
- [`graphFiles.readLiveDocGraph`](../../engine/src/live-docs/graphFiles.ts.mdmd.md#symbol-readlivedocgraph)
- [`graphFiles.writeLiveDocGraph`](../../engine/src/live-docs/graphFiles.ts.mdmd.md#symbol-writelivedocgraph)
- [`pathUtils.normalizeWorkspacePath`](../../engine/src/tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
- [`pathUtils.toWorkspaceFileUri`](../../engine/src/tooling/pathUtils.ts.mdmd.md#symbol-toworkspacefileuri)
- [`pathUtils.toWorkspaceRelativePath`](../../engine/src/tooling/pathUtils.ts.mdmd.md#symbol-toworkspacerelativepath)
<!-- LIVE-DOC:END Dependencies -->
