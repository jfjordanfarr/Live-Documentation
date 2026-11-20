# `packages/generator/src/history/summarizeChange.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/generator/src/history/summarizeChange.ts`
- Generated At: 2026-11-20T14:56:07.644Z

## Authored
### Purpose
One commit's summary: the generator run over the commit's working tree under the lens's configuration, the derived graph's shape written to the cache, and the full index too when asked; and the worker the history command starts a few of, each of which summarizes commit after commit in a tree it writes itself and brings forward from one commit to the next.

### Notes
- Written 2026-10-17 for C1 of [the plan](../../../../../../.mdmd/layer-3/change-over-time.mdmd.md). The docs are written into the scratch tree's own docs root, never the real one, and the lens's configuration is applied verbatim, so its docs root stays undocumented as source. Until 2026-10-20 the mirror committed at that commit was removed first: it carries the generator of its day (the plan's failed idea of reading it), and its orphans with authored words would otherwise survive the generator's pruning into the reading.
- Since 2026-10-20 ([Turn 9](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-20/2026-10-20.1.record.md#turn-9)) the mirror is regenerated in place, as the owner asked: today's generator rewrites every generated section, so nothing of the generator of that day is read, and keeps that day's authored words, where the doc links are; `keepAuthoredStaleDocs: false` prunes every doc this run does not document, an orphan with words included, so a commit's files and wires are exactly a fresh generation's. Each file's related documents (`relatedDocsOf`) that stand in the commit's tree go into the summary.
- A summary is written to a temporary name and renamed into place, so that a stopped run leaves no summary the cache would trust.
- Since 2026-11-19 ([Turn 35](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-35) and [Turn 37](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-37) of November 18) the summary keeps each file's rows and names its prose by hash (`summary.ts`); its texts are put in the lens's text store before the summary, gzipped, is renamed into place, so that a summary in the cache never names a text the store lacks.
- Before the generator runs, each doc of the mirror committed at that commit, where the lens's configuration reads docs, is read for an `## Authored` heading, the one the generator carries a doc's words forward under whether or not the rest meets today's grammar. A doc without one is `unread`: the generator writes its placeholder, and the summary says so rather than pass the placeholder off as that day's words. Over this repository that is the hand-written mirror of October 2025; from December 2025 every doc sampled has an authored block bounded by `## Generated`, though today's strict parser reads the mirror only from 2026-09-27.
- After each commit the process sends the history command its peak resident memory since it began (`process.resourceUsage().maxRSS`), which is what one lane of the pool holds and what sizes the pool.
- From [the third review](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Probes/history-data-review/third-review.md) until 2026-11-20 the process took the path of a file holding its task, which could outgrow the command line; since then the tasks come over the channel to the command.
- Since 2026-11-20 ([the record of that day](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/history-rebuild-fast/README.md), on the owner's hope that "rebuilding the history somehow becomes quicker") it is a worker (`work`, `--worker <repository> <folder>`): started once, it writes its first commit's tree and brings it forward to each next (`WorkingTree.bringTo`), under one folder name for the worker's life (until the independent review of that day, a folder of a new name for each commit). The tree's git environment is set in the process only while it summarizes in that tree and removed in a `finally`, since the generator's git calls inherit it and carried over it would ask another commit's index silently; `history-workers.test.ts` holds one worker's summaries to fresh processes'. What else a process keeps between commits is taken entry by entry in `work`'s remarks and in the record. `treeOptions`, the rule of what a tree holds, moved here from `regenerate.ts` with the writing of trees. Before, each commit had a process of its own, and the command wrote every tree on its own main thread, which the pool waited for.
- Since the fourth round of that review (2026-11-20, [the record](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/history-rebuild-fast/README.md)) a worker in which anything threw while a tree-sitter tree was taken, read or released (`runtimeFaulted`) writes nothing of that commit, no text, summary or index, unless the commit was its first: `summarizeChange` asks `publishable` once the generator has run and before anything is written, and the report says `published: false`; the command ends the worker and gives the commit to a fresh one, whose first commit is what a fresh process makes and is written whatever it is. Before, the commit was written and the worker ended after it. Each report also carries the memory the worker holds after the commit (`heldMemory`, resident, and `heapShare`, of its heap's limit), by which the command replaces it (`regenerate.ts`); `history-workers.test.ts` faults a real worker through node's own `--import`.
- Since 2026-11-19 the summary keeps every linked and citing document: it is made under the configuration the command hands it, `summarizedConfiguration`, which has no bundle exclusion, and the exclusions are applied where the summaries are read (`bundled.ts`), so that they are not in the lens's key ([the decision](../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#every-name-of-a-commits-tree-stands-and-the-bundles-exclusions-apply-where-summaries-are-read-recorded-2026-11-19)). Whether a linked document stood is asked of the commit's own listing (`git ls-files` against the tree's index), not the disk, since the tree leaves out the files the configuration excludes; `standingFiles` says where the two answers can differ and which is right.
- Whether a linked document stood is asked of the commit's own listing, in which a symbolic link the tree wrote as a copy stands as the file it leads to; on a disk that tells case apart the listing and the disk now answer alike, since every name is written, and the listing keeps the answer the same on disks that fold case and Unicode form.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SummaryTask` {#symbol-summarytask}
- Type: interface
- Source: [source](../../../../../../packages/generator/src/history/summarizeChange.ts#L68)

##### `SummaryTask` — Summary
What one process is asked to do.

#### `summarizeChange` {#symbol-summarizechange}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/summarizeChange.ts#L98)
- Parameters: `task`: [`SummaryTask`](#symbol-summarytask)

##### `summarizeChange` — Summary
Generates the change's docs in its working tree and writes its summary, and its index when asked, unless
`publishable` says no once the generator has run: then nothing of the change is written, neither a text nor the
summary nor the index.

##### `summarizeChange` — Parameters
- `publishable`: Asked once the generator has run, before anything is written: whether what it derived may be kept.
- `warn`: Where each line the generator warns goes, for the history command to gather across the changes.

##### `summarizeChange` — Returns
Whether the summary was written.

#### `treeOptions` {#symbol-treeoptions}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/summarizeChange.ts#L144)
- Returns: [`WorkingTreeOptions`](../../../engine/src/live-docs/history/versionControl.ts.mdmd.md#symbol-workingtreeoptions)
- Parameters: `configuration`: [`LiveDocumentationConfig`](../../../engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig)

##### `treeOptions` — Summary
What the history asks of a change's tree written at `tree`: every name stands, and every file holds its content but
one kind. A file is written empty only when the configuration's `exclude` names it (by discovery's own rule,
`matchesPathPattern`), it lies outside the docs root (discovery's `docsRootWithin`), which the generator reads and
rewrites whatever `exclude` says, and it is an image, a font or a recording (`isMediaAsset`), whose bytes no reader
reads whatever names it: an import of a picture or a resolver's probe finds the name, as over a checkout. Any other
file is written whole, since a reader may open any text file another file names (the C reader opens whatever an
include names, `.def` and `.inc` among them, though no reader handles those kinds on their own). A symbolic link at
or above the docs root is not written even as a copy, and the docs root is where the generator writes, which a tree
brought forward puts right whole.

Until a review of 2026-11-19 the excluded files were left out altogether, on the strength of one measurement over
this repository that the summarizing process opened none; for a few hours after, every excluded file no reader
handles was written empty, until the review's second pass found the C reader opening such files. Until 2026-11-20 it
lay in `regenerate.ts`, whose process wrote every tree.

#### `standingFiles` {#symbol-standingfiles}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/summarizeChange.ts#L185)
- Parameters: `unwritten`: `ReadonlyArray`

##### `standingFiles` — Summary
The files that stand in the change's tree, by their repository-relative paths, read from the tree's own listing
(its index, which the history command made from the change's tree and named in this process's environment): a
regular file stands, and so does a symbolic link the tree writer wrote as a copy of the file it leads to, which is
every link not named unwritten; a submodule does not, nor any entry the tree did not hold (`unwritten`).

The listing, not the disk, so that whether a linked document stood depends on the commit alone. Every name of the
tree is written, so on a disk that tells case apart the two agree; on one that folds case or Unicode form, as macOS's
and Windows's do, the disk would find `Docs/Design.md` for a link to `docs/design.md`, and the listing does not.
That holds of this question only: the generator's own resolution of an import still asks the disk. Until 2026-11-19
the disk was asked here (`stat`, then `isFile`).

#### `WorkerTask` {#symbol-workertask}
- Type: type
- Source: [source](../../../../../../packages/generator/src/history/summarizeChange.ts#L220)

##### `WorkerTask` — Summary
What the history command asks of a worker: one change summarized, its tree written or brought forward by the worker.

#### `WorkerReport` {#symbol-workerreport}
- Type: interface
- Source: [source](../../../../../../packages/generator/src/history/summarizeChange.ts#L223)

##### `WorkerReport` — Summary
What a worker answers for each task.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `glob` - `glob`
- `node:fs` - `promises`
- `node:path` - `path`
- `node:v8` - `getHeapStatistics`
- `node:zlib` - `gzipSync`
- [`LiveDocumentationConfig`](../../../engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig)
- [`liveDocumentationConfig.isMediaAsset`](../../../engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-ismediaasset)
- [`treeSitter.runtimeFaulted`](../../../engine/src/live-docs/adapters/treeSitter.ts.mdmd.md#symbol-runtimefaulted)
- [`archetype.matchesPathPattern`](../../../engine/src/live-docs/archetype.ts.mdmd.md#symbol-matchespathpattern)
- [`discovery.docsRootWithin`](../../../engine/src/live-docs/discovery.ts.mdmd.md#symbol-docsrootwithin)
- [`gitUtils.execFileAsync`](../../../engine/src/live-docs/gitUtils.ts.mdmd.md#symbol-execfileasync)
- [`graph.LiveDocGraph`](../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph) (type-only)
- [`git.openGitStore`](../../../engine/src/live-docs/history/git.ts.mdmd.md#symbol-opengitstore)
- [`summary.AuthoredReading`](../../../engine/src/live-docs/history/summary.ts.mdmd.md#symbol-authoredreading)
- [`summary.summarizeGraph`](../../../engine/src/live-docs/history/summary.ts.mdmd.md#symbol-summarizegraph)
- [`textStore.putTexts`](../../../engine/src/live-docs/history/textStore.ts.mdmd.md#symbol-puttexts)
- [`versionControl.WorkingTree`](../../../engine/src/live-docs/history/versionControl.ts.mdmd.md#symbol-workingtree) (type-only)
- [`versionControl.WorkingTreeOptions`](../../../engine/src/live-docs/history/versionControl.ts.mdmd.md#symbol-workingtreeoptions) (type-only)
- [`relatedDocs.relatedDocsOf`](../../../engine/src/live-docs/relatedDocs.ts.mdmd.md#symbol-relateddocsof)
- [`generator.generateLiveDocs`](../generator.ts.mdmd.md#symbol-generatelivedocs)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../../../layer-3/architectural-decisions.mdmd.md)
- [`.mdmd/layer-3/change-over-time.mdmd.md`](../../../../../layer-3/change-over-time.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
