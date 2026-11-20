# `packages/generator/src/history/headCheck.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/generator/src/history/headCheck.ts`
- Generated At: 2026-11-20T09:32:49.182Z

## Authored
### Purpose
The check at the head: the history's last step, replayed through every step from its base, compared field by field with the graph read afresh from the Live Docs committed at the commit the history ends at, so that a fault anywhere between the generator and the replay shows as a named difference.

### Notes
- Written 2026-11-19 after [the independent review](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Probes/history-data-review/README.md) found that the rows' side of the check ran the committed graph through the same `summarizeGraph` and `rowsOfSummary` that made the summaries, so a fault in them would have been found on both sides alike. The committed side is now read here from the doc reader's model: each symbol's heading, anchor, kind, flags, type names and description's sections, each dependency line's label and qualifiers, the entries, re-exported anchors, citing documents and authored block, and the links from the graph's resolved edges. Texts are compared by their words, never by the hash or id they are stored under.
- What the two sides share is the doc reader (`readLiveDocGraph`) and the meaning of the fields compared.
- When the check applies is `computeHistory.ts`'s rule, `HEAD_CHECK_RULE`: when asked with `--check-head`, or when the generator runs unmodified from the head under the workspace's own configuration.

- Since 2026-11-20 ([the record of making a run fast](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/history-rebuild-fast/README.md)) the committed docs are read from git's object store (`committedLiveDocGraph`): the docs under the base layer, a doc that is a link followed through the commit's own listing as the tree writer follows it, each parsed as `readLiveDocGraph` parses a doc on disk. Before, the head's whole tree was written to read them, 5 to 7 s of every run at this repository's head. A name the disk would take for another's, or could not hold, is read here under its own name, as the commit stores it. The module starts git, so the lens's guard lists it among the unkeyed modules that do, with the reason that nothing it reads reaches a summary.
- Mended the same day after [an independent review](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/history-rebuild-fast/README.md#the-independent-review-and-its-mends): the first form read the targets of the links among the docs alone, where following a link needs the target of every link it meets, so a doc that was a link to a link outside the base layer, or reached through a folder that is a link, read as a link to nothing and the check failed falsely; now every link of the listing is read, as the tree writer reads them. And since the summaries' side still comes from the tree writer, which leaves out names the committed docs can hold (a name Windows reserves such as `aux.ts`, on Windows; names a folding disk takes for one; a name that is not UTF-8), the check now compares no committed file the head's summary lists as left out (`leftOutAtHead`), nor a link to or from it, and its line names each with why. The generator mirrors source names, so such docs can stand. The listing and the batch reader repeat two of `git.ts`'s readers, which keys the lens: they are to be folded into it at the next change that moves the lens anyway.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `committedLiveDocGraph` {#symbol-committedlivedocgraph}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/headCheck.ts#L57)
- Parameters: `location`: [`DocLocation`](../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-doclocation)

##### `committedLiveDocGraph` — Summary
The graph of the Live Docs committed at a commit, read from git's object store: every file of the commit's tree under
the docs root's base layer whose name ends in the docs' extension, a regular or an executable file, or a symbolic link
that leads through the commit's own listing to one ({@link followLink}, given the target of every link of the listing,
as the history's tree writer gives it), each blob's bytes read as UTF-8 and parsed as `readLiveDocGraph` parses a doc
on disk.

##### `committedLiveDocGraph` — Remarks
Until 2026-11-20 the commit's whole tree was written to a scratch folder for this, as each commit's tree is written
for its summary, and the docs read back from the disk: 5 to 7 s of every run at this repository's head, almost all
of it the writing of files the check never reads. What the disk could change, the object store does not: a name the
tree writer leaves out of a tree (one Windows reserves, a name two entries share on a disk that folds case or
normalization, one that is not UTF-8) is read here under its own name, as the commit stores it. The check compares
no such file ({@link leftOutAtHead}). For the first form of this reader the independent review of 2026-11-20 found
that only the targets of the links among the docs were read, so that a doc that is a link to a link outside the base
layer, or reached through a folder that is a link, was taken for a link to nothing.

The listing and the batch reader repeat two of `git.ts`'s readers, which this module does not import because that
file keys the history's lens and an edit of it would derive every summary again; they are to be folded into it at the
next change that moves the lens anyway.

#### `ReplayedMoment` {#symbol-replayedmoment}
- Type: interface
- Source: [source](../../../../../../packages/generator/src/history/headCheck.ts#L126)

##### `ReplayedMoment` — Summary
A moment of the history, as replayed: its shape and its rows.

#### `leftOutAtHead` {#symbol-leftoutathead}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/headCheck.ts#L142)
- Parameters: `committed`: [`LiveDocGraph`](../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph); `leftOut`: `ReadonlyMap`

##### `leftOutAtHead` — Summary
The committed files the check at the head does not compare, each with why: those whose source or whose doc the head's
tree did not hold, by the head summary's own list (`unwritten`). The history never read such a file, and the tree
writer leaves out names the committed docs can hold (a name Windows reserves, such as `aux.ts`, on Windows; two names
one on a disk that folds case or normalization; a name that is not UTF-8), so comparing them would fail the check
where the history is right. The check that read the committed docs from git's object store compared them until the
independent review of 2026-11-20; the one before it wrote the head's tree to the same disk, which left the same names
out of both sides.

##### `leftOutAtHead` — Parameters
- `leftOut`: Each entry the head's tree did not hold, by its path, with why.

#### `headDifferences` {#symbol-headdifferences}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/headCheck.ts#L157)
- Parameters: `replayed`: [`ReplayedMoment`](#symbol-replayedmoment); `committed`: [`LiveDocGraph`](../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph); `notCompared`: `ReadonlySet`

##### `headDifferences` — Summary
Where a replayed moment differs from a graph derived from committed Live Docs, in words.

##### `headDifferences` — Parameters
- `notCompared`: The files left out of the comparison ({@link leftOutAtHead}), with every link to or from them.
- `textOf`: The text the replayed rows name by an id.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `spawn`
- `node:path` - `path`
- [`document.LiveDocSyntaxError`](../../../engine/src/live-docs/document.ts.mdmd.md#symbol-livedocsyntaxerror)
- [`document.parseLiveDoc`](../../../engine/src/live-docs/document.ts.mdmd.md#symbol-parselivedoc)
- [`gitUtils.execFileAsync`](../../../engine/src/live-docs/gitUtils.ts.mdmd.md#symbol-execfileasync)
- [`graph.DocLocation`](../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-doclocation)
- [`graph.GraphFile`](../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-graphfile)
- [`graph.LiveDocGraph`](../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph)
- [`graph.deriveLiveDocGraph`](../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-derivelivedocgraph)
- [`graph.linkTarget`](../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-linktarget-function)
- [`git.followLink`](../../../engine/src/live-docs/history/git.ts.mdmd.md#symbol-followlink)
- [`rows.FileRows`](../../../engine/src/live-docs/history/rows.ts.mdmd.md#symbol-filerows)
- [`rows.RowLink`](../../../engine/src/live-docs/history/rows.ts.mdmd.md#symbol-rowlink)
- [`Rows`](../../../engine/src/live-docs/history/rows.ts.mdmd.md#symbol-rows)
- [`rows.compareLinks`](../../../engine/src/live-docs/history/rows.ts.mdmd.md#symbol-comparelinks)
- [`rows.linksOf`](../../../engine/src/live-docs/history/rows.ts.mdmd.md#symbol-linksof)
- [`Shape`](../../../engine/src/live-docs/history/shape.ts.mdmd.md#symbol-shape) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/change-over-time.mdmd.md`](../../../../../layer-3/change-over-time.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
