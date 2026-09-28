# packages/generator/src/generator.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/generator/src/generator.ts
- Generated At: 2026-09-28T00:41:37.681Z

## Authored
### Purpose
Coordinates Live Documentation generation: analyzes source files, carries authored sections forward, writes deterministic markdown mirrors, prunes stale docs, and writes the graph index after every run.

### Notes
- After the docs are written, every doc on disk is read back through the grammar and the graph derived from them is written to `<root>/index.json` (since 2026-09-28). A preserved orphan the grammar refuses fails that step with its path and line; the docs already written stay written. A dry run writes nothing, the index included.
- A doc is rewritten only when its rendered text differs from what is on disk, and only then does its `Generated At` line move.

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
- [`LiveDocumentationConfig`](../../shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig)
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`core.SourceAnalysisResult`](../../shared/src/live-docs/core.ts.mdmd.md#symbol-sourceanalysisresult)
- [`core.WorkspaceFileIndex`](../../shared/src/live-docs/core.ts.mdmd.md#symbol-workspacefileindex)
- [`core.WorkspaceSymbolIndex`](../../shared/src/live-docs/core.ts.mdmd.md#symbol-workspacesymbolindex)
- [`core.analyzeSourceFile`](../../shared/src/live-docs/core.ts.mdmd.md#symbol-analyzesourcefile)
- [`core.buildWorkspaceSymbolIndex`](../../shared/src/live-docs/core.ts.mdmd.md#symbol-buildworkspacesymbolindex)
- [`core.cleanupEmptyParents`](../../shared/src/live-docs/core.ts.mdmd.md#symbol-cleanupemptyparents)
- [`core.composeDependencies`](../../shared/src/live-docs/core.ts.mdmd.md#symbol-composedependencies)
- [`core.composeReExports`](../../shared/src/live-docs/core.ts.mdmd.md#symbol-composereexports)
- [`core.composeSymbolBlocks`](../../shared/src/live-docs/core.ts.mdmd.md#symbol-composesymbolblocks)
- [`core.computePublicSymbolHeadingInfo`](../../shared/src/live-docs/core.ts.mdmd.md#symbol-computepublicsymbolheadinginfo)
- [`core.directoryExists`](../../shared/src/live-docs/core.ts.mdmd.md#symbol-directoryexists)
- [`core.discoverTargetFiles`](../../shared/src/live-docs/core.ts.mdmd.md#symbol-discovertargetfiles)
- [`core.hasMeaningfulAuthoredContent`](../../shared/src/live-docs/core.ts.mdmd.md#symbol-hasmeaningfulauthoredcontent)
- [`core.resolveArchetype`](../../shared/src/live-docs/core.ts.mdmd.md#symbol-resolvearchetype)
- [`document.LiveDoc`](../../shared/src/live-docs/document.ts.mdmd.md#symbol-livedoc)
- [`document.LiveDocSyntaxError`](../../shared/src/live-docs/document.ts.mdmd.md#symbol-livedocsyntaxerror)
- [`document.authoredBlockOf`](../../shared/src/live-docs/document.ts.mdmd.md#symbol-authoredblockof)
- [`document.parseLiveDoc`](../../shared/src/live-docs/document.ts.mdmd.md#symbol-parselivedoc)
- [`document.renderLiveDoc`](../../shared/src/live-docs/document.ts.mdmd.md#symbol-renderlivedoc)
- [`graphFiles.readLiveDocGraph`](../../shared/src/live-docs/graphFiles.ts.mdmd.md#symbol-readlivedocgraph)
- [`graphFiles.writeLiveDocGraph`](../../shared/src/live-docs/graphFiles.ts.mdmd.md#symbol-writelivedocgraph)
- [`pathUtils.normalizeWorkspacePath`](../../shared/src/tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
- [`pathUtils.toWorkspaceFileUri`](../../shared/src/tooling/pathUtils.ts.mdmd.md#symbol-toworkspacefileuri)
- [`pathUtils.toWorkspaceRelativePath`](../../shared/src/tooling/pathUtils.ts.mdmd.md#symbol-toworkspacerelativepath)
<!-- LIVE-DOC:END Dependencies -->
