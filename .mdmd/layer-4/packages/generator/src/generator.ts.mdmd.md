# `packages/generator/src/generator.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/generator/src/generator.ts`
- Entry: module of [`packages/generator/package.json`](../package.json.mdmd.md)
- Generated At: 2026-11-22T07:12:56.986Z

## Authored
### Purpose
Coordinates Live Documentation generation: analyzes source files, carries authored sections forward, writes deterministic markdown mirrors, prunes stale docs, and writes the graph index after every run.

### Notes
- Current signature composition (2026-11-08) receives the same analyzed dependency entries as dependency composition, so imported type links can use the known module provider and aliases instead of guessing from workspace names.
- After the docs are written, every doc on disk is read back through the grammar and the graph derived from them is written to `<root>/index.json` (since 2026-09-28). A preserved orphan the grammar refuses fails that step with its path and line; the docs already written stay written. A dry run writes nothing, the index included.
- A doc is rewritten only when its rendered text differs from what is on disk, and only then does its `Generated At` line move.
- Since 2026-10-09 ([Turn 10 of the October 9 session](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-09/2026-10-09.1.record.md#turn-10)) a run warns when the folder lies inside a scan, a docs root or a configuration file of this tool above it, and when a scan lies inside the folder, found by one walk for the docs root's and the configuration file's names below it; a scan never lies inside another scan, the owner's rule for the World Map, and the warning says to point at one of them. It warns and does not refuse, since the generator cannot know whether the other scan is current or abandoned.
- Since 2026-10-15 ([Turn 4](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-15/2026-10-15.1.record.md#turn-4)) the first pass builds the entry index beside the symbol index, and `composeGenerated` writes each doc's `Entry` lines from the file's own analysis, the index, its symbol kinds, the tooling rule and the configuration's `entryPoints`, before the three sections.
- Since 2026-10-19, `--changed` and `--include` build file, symbol and entry indexes from the discovered workspace even when they render a subset, so links from a selected doc to an unselected source remain available. Changed-only pruning checks just changed source paths, including rename origins, and preserves authored orphans. It does not invalidate unchanged consumers of a changed provider; full generation refreshes them.
- The stale-doc pruner owns its two filesystem helpers. `directoryExists` treats a stat failure as absence; `cleanupEmptyParents` removes empty parents after a doc deletion up to, but not including, the base-layer root, and stops on a nonempty folder or filesystem error. They were extracted into an engine `fileUtils.ts` during [the December 6 refactor](../../../../../AI-Agent-Workspace/AgentSessionHistory/2025/12/Summarized/2025-12-06.3.SUMMARIZED.md) and returned to their only caller on 2026-10-19; no analysis or doc-format behavior changed.
- `keepAuthoredStaleDocs` (2026-10-20, [Turn 9](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-20/2026-10-20.1.record.md#turn-9)) decides whether a stale doc with authored words is kept: true for a person's workspace, so no written words vanish unread; false for the history's lens, so that a past commit's mirror regenerated in place gives exactly the files this run documents.
- Since 2026-10-22 ([Turn 8 of the October 21 session](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-21/2026-10-21.1.record.md#turn-8)) a new doc of a file no reader handles (`noReaderHandles`: no reader by name or extension, and not an image, a font or a recording) starts with `UNREAD_AUTHORED_BLOCK`, whose Notes say so in place of `_Pending notes_`. The note is written once, when the doc is made; from then on it is the author's to keep or revise, and a doc holding nothing but it is pruned with its file like one holding the pending placeholders.
- Since 2026-10-22 ([the decision](../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#related-documents-run-both-ways-a-docs-cited-by-section-is-generated-from-the-documents-own-links-recorded-2026-10-22)) a run reads every markdown document discovery finds (`readMarkdownDocuments`), whatever subset it renders, and `citingDocuments` turns their links into the `Cited By` index that `composeGenerated` writes on each cited file's doc, when the configuration's `citedBy` is on; on this repository the reading adds under a second to a run. A document's change therefore moves the docs of the files it cites or stops citing, which a full run or `--check` sees and a `--changed` run, which renders changed sources alone, does not.
- Since 2026-11-12 the nested-scan warning says that the run writes the docs all the same and what the rule will mean, that a board naming both scans reads only the outer one. Its words were "Point at one of them", which read as a refusal while the run carried on, as [the first-visit evaluation](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-12/Screenshots/first-visit/README.md) found; the rule and the behaviour are unchanged.
- Since 2026-11-12 a folder git ignores is no scan: `scansWithin` asks git, through `gitIgnored`, of the docs roots and configuration files it finds, and `scansAbove` does not count an outer scan whose git ignores this folder, after an agent's worktree under the ignored `.claude/worktrees/`, which carries a copy of the configuration, made every run in the checkout warn of a nested scan. It is the owner's rule of 2026-10-19 that what git ignores never becomes part of the map; without git, every one still counts.
- Since 2026-11-19 what makes a folder a scan of its own is named once (`scanMarkers`: a docs root or this tool's configuration file) and read by the search above the workspace and the search below it; a matcher of the same marks for the history's tree writer was built that day and removed when the tree began to write every name. still written and still warned of.

- Since 2026-11-19 ([the probe's third leg](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/windows-and-cli/README.md#third-leg-november-19)) a file the run cannot map, because it cannot be read or because the doc written for it is one the grammar's own reader refuses, is skipped and named in `failed` by its source path with the reason, and the run goes on to write every other doc and the index; each doc is read back by `parseLiveDoc` before it is written. Until then one refused doc stopped the run after every doc was written and before the index, naming the doc and not the source, and the next run called the docs of the failed run unchanged. A failed file's old doc is removed only when the reader refuses it and it holds no authored words. The run also classifies each file a reader reads by the one reading step (`decodeSourceText`) and returns in `readings` the files read as UTF-16, as Windows-1252, and not read as text.
- Since 2026-11-20 two probes of the run's own folders, `directoryExists` before pruning and `isScan` above the workspace, hand a failure of the machine's to `throwIfMachineFailure` ([sourceText.ts](../../engine/src/tooling/sourceText.ts.mdmd.md)), so that it stops the run rather than read as a folder gone or a folder without a scan; before, each read every failure so, and a docs root that could not be probed was pruned of nothing, unsaid. The reviewer's second look of that day found them; a case each holds them. The third it found, `cleanupEmptyParents`, stopped the run so for one commit and was put back the same day by the root's ruling: removing a pruned doc's empty folder is tidying, no fact is read from it, a run stopped there would pass on a second try with nothing mended, and on Windows a folder another program holds is ordinary, so any failure leaves the folder, which its case holds.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LiveDocGeneratorResult` {#symbol-livedocgeneratorresult}
- Type: interface
- Source: [source](../../../../../packages/generator/src/generator.ts#L66)

##### `LiveDocGeneratorResult` — Summary
Summary returned by {@link generateLiveDocs} after processing all target files.

The caller uses `written` and `deleted` counts for progress reporting, while
the `files` array gives per-file detail for dry-run previews and CI checks.

#### `SourceReadings` {#symbol-sourcereadings}
- Type: interface
- Source: [source](../../../../../packages/generator/src/generator.ts#L87)

##### `SourceReadings` — Summary
The files the one reading step read as UTF-16 or as Windows-1252, and those it did not read as text, by source path.

#### `generateLiveDocs` {#symbol-generatelivedocs}
- Type: function
- Source: [source](../../../../../packages/generator/src/generator.ts#L128)
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
- [`LiveDocumentationConfig`](../../engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig) (type-only)
- [`liveDocumentationConfig.hasReader`](../../engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-hasreader)
- [`liveDocumentationConfig.noReaderHandles`](../../engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-noreaderhandles)
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`core.BINARY_SNIFF_BYTES`](../../engine/src/live-docs/core.ts.mdmd.md#symbol-binary_sniff_bytes)
- [`core.SourceAnalysisResult`](../../engine/src/live-docs/core.ts.mdmd.md#symbol-sourceanalysisresult) (type-only)
- [`core.WorkspaceEntryIndex`](../../engine/src/live-docs/core.ts.mdmd.md#symbol-workspaceentryindex) (type-only)
- [`core.WorkspaceFileIndex`](../../engine/src/live-docs/core.ts.mdmd.md#symbol-workspacefileindex) (type-only)
- [`core.WorkspaceSymbolIndex`](../../engine/src/live-docs/core.ts.mdmd.md#symbol-workspacesymbolindex) (type-only)
- [`core.WorkspaceTestIndex`](../../engine/src/live-docs/core.ts.mdmd.md#symbol-workspacetestindex) (type-only)
- [`core.analyzeSourceFile`](../../engine/src/live-docs/core.ts.mdmd.md#symbol-analyzesourcefile)
- [`core.buildWorkspaceIndexes`](../../engine/src/live-docs/core.ts.mdmd.md#symbol-buildworkspaceindexes)
- [`core.composeCitedBy`](../../engine/src/live-docs/core.ts.mdmd.md#symbol-composecitedby)
- [`core.composeDependencies`](../../engine/src/live-docs/core.ts.mdmd.md#symbol-composedependencies)
- [`core.composeEntries`](../../engine/src/live-docs/core.ts.mdmd.md#symbol-composeentries)
- [`core.composeReExports`](../../engine/src/live-docs/core.ts.mdmd.md#symbol-composereexports)
- [`core.composeSymbolBlocks`](../../engine/src/live-docs/core.ts.mdmd.md#symbol-composesymbolblocks)
- [`core.computePublicSymbolHeadingInfo`](../../engine/src/live-docs/core.ts.mdmd.md#symbol-computepublicsymbolheadinginfo)
- [`core.discoverDocuments`](../../engine/src/live-docs/core.ts.mdmd.md#symbol-discoverdocuments)
- [`core.discoverTargetFiles`](../../engine/src/live-docs/core.ts.mdmd.md#symbol-discovertargetfiles)
- [`core.hasMeaningfulAuthoredContent`](../../engine/src/live-docs/core.ts.mdmd.md#symbol-hasmeaningfulauthoredcontent)
- [`core.isBinaryContent`](../../engine/src/live-docs/core.ts.mdmd.md#symbol-isbinarycontent)
- [`core.resolveArchetype`](../../engine/src/live-docs/core.ts.mdmd.md#symbol-resolvearchetype)
- [`discovery.inWorkspaceOrder`](../../engine/src/live-docs/discovery.ts.mdmd.md#symbol-inworkspaceorder)
- [`document.DEFAULT_AUTHORED_BLOCK`](../../engine/src/live-docs/document.ts.mdmd.md#symbol-default_authored_block)
- [`document.LiveDoc`](../../engine/src/live-docs/document.ts.mdmd.md#symbol-livedoc) (type-only)
- [`document.LiveDocSyntaxError`](../../engine/src/live-docs/document.ts.mdmd.md#symbol-livedocsyntaxerror)
- [`document.UNREAD_AUTHORED_BLOCK`](../../engine/src/live-docs/document.ts.mdmd.md#symbol-unread_authored_block)
- [`document.authoredBlockOf`](../../engine/src/live-docs/document.ts.mdmd.md#symbol-authoredblockof)
- [`document.parseLiveDoc`](../../engine/src/live-docs/document.ts.mdmd.md#symbol-parselivedoc)
- [`document.renderLiveDoc`](../../engine/src/live-docs/document.ts.mdmd.md#symbol-renderlivedoc)
- [`gitUtils.detectChangedFiles`](../../engine/src/live-docs/gitUtils.ts.mdmd.md#symbol-detectchangedfiles)
- [`graphFiles.readLiveDocGraph`](../../engine/src/live-docs/graphFiles.ts.mdmd.md#symbol-readlivedocgraph)
- [`graphFiles.writeLiveDocGraph`](../../engine/src/live-docs/graphFiles.ts.mdmd.md#symbol-writelivedocgraph)
- [`processMark.markProcess`](../../engine/src/live-docs/processMark.ts.mdmd.md#symbol-markprocess)
- [`relatedDocs.DocumentText`](../../engine/src/live-docs/relatedDocs.ts.mdmd.md#symbol-documenttext) (type-only)
- [`relatedDocs.citingDocuments`](../../engine/src/live-docs/relatedDocs.ts.mdmd.md#symbol-citingdocuments)
- [`relatedDocs.isMarkdownDocument`](../../engine/src/live-docs/relatedDocs.ts.mdmd.md#symbol-ismarkdowndocument)
- [`gitIgnored`](../../engine/src/tooling/gitIgnored.ts.mdmd.md#symbol-gitignored)
- [`nodeHost.NODE_FILE_HOST`](../../engine/src/tooling/nodeHost.ts.mdmd.md#symbol-node_file_host)
- [`pathUtils.normalizeWorkspacePath`](../../engine/src/tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
- [`pathUtils.toWorkspaceRelativePath`](../../engine/src/tooling/pathUtils.ts.mdmd.md#symbol-toworkspacerelativepath)
- [`sourceText.SourceTextReading`](../../engine/src/tooling/sourceText.ts.mdmd.md#symbol-sourcetextreading) (type-only)
- [`sourceText.readSourceReading`](../../engine/src/tooling/sourceText.ts.mdmd.md#symbol-readsourcereading)
- [`sourceText.throwIfMachineFailure`](../../engine/src/tooling/sourceText.ts.mdmd.md#symbol-throwifmachinefailure)
- [`workspaceFiles.FileHost`](../../engine/src/tooling/workspaceFiles.ts.mdmd.md#symbol-filehost) (type-only)
- [`workspaceFiles.workspaceReads`](../../engine/src/tooling/workspaceFiles.ts.mdmd.md#symbol-workspacereads-function)
- [`workspaceListing`](../../engine/src/tooling/workspaceListing.ts.mdmd.md#symbol-workspacelisting-function)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../../layer-3/architectural-decisions.mdmd.md)
- [`.mdmd/layer-3/live-documentation-pipeline.mdmd.md`](../../../../layer-3/live-documentation-pipeline.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
