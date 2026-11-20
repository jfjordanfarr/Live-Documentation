# `packages/generator/src/history/headCheck.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/generator/src/history/headCheck.ts`
- Generated At: 2026-11-20T08:22:37.401Z

## Authored
### Purpose
The check at the head: the history's last step, replayed through every step from its base, compared field by field with the graph read afresh from the Live Docs committed at the commit the history ends at, so that a fault anywhere between the generator and the replay shows as a named difference.

### Notes
- Written 2026-11-19 after [the independent review](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Probes/history-data-review/README.md) found that the rows' side of the check ran the committed graph through the same `summarizeGraph` and `rowsOfSummary` that made the summaries, so a fault in them would have been found on both sides alike. The committed side is now read here from the doc reader's model: each symbol's heading, anchor, kind, flags, type names and description's sections, each dependency line's label and qualifiers, the entries, re-exported anchors, citing documents and authored block, and the links from the graph's resolved edges. Texts are compared by their words, never by the hash or id they are stored under.
- What the two sides share is the doc reader (`readLiveDocGraph`) and the meaning of the fields compared.
- When the check applies is `computeHistory.ts`'s rule, `HEAD_CHECK_RULE`: when asked with `--check-head`, or when the generator runs unmodified from the head under the workspace's own configuration.

- Since 2026-11-20 ([the record of making a run fast](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/history-rebuild-fast/README.md)) the committed docs are read from git's object store (`committedLiveDocGraph`): the docs under the base layer, a link among them followed through the commit's own listing as the tree writer follows it, each parsed as `readLiveDocGraph` parses a doc on disk. Before, the head's whole tree was written to read them, 5 to 7 s of every run at this repository's head. A name the disk would take for another's, or could not hold, is read here under its own name: the more correct reading of what the commit holds, and the one a Windows disk needs, where two names that differ by case alone are one file and some names cannot be written at all, so that the tree written there no longer stands between the commit and the check. The module starts git, so the lens's guard lists it among the unkeyed modules that do, with the reason that nothing it reads reaches a summary.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `committedLiveDocGraph` {#symbol-committedlivedocgraph}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/headCheck.ts#L49)
- Parameters: `location`: [`DocLocation`](../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-doclocation)

##### `committedLiveDocGraph` — Summary
The graph of the Live Docs committed at a commit, read from git's object store: every file of the commit's tree under
the docs root's base layer whose name ends in the docs' extension, a regular or an executable file, or a symbolic link
that leads through the commit's own listing to one ({@link followLink}, as the history's tree writer follows it), each
blob's bytes read as UTF-8 and parsed as `readLiveDocGraph` parses a doc on disk.

##### `committedLiveDocGraph` — Remarks
Until 2026-11-20 the commit's whole tree was written to a scratch folder for this, as each commit's tree is written
for its summary, and the docs read back from the disk: 5 to 7 s of every run at this repository's head, almost all
of it the writing of files the check never reads. What the disk could change, the object store does not: a name the
disk takes for another's (two docs whose names differ by case alone, on a disk that folds case) or one it cannot
hold is read here under its own name, as the commit stores it. The generator writes no such names.

#### `ReplayedMoment` {#symbol-replayedmoment}
- Type: interface
- Source: [source](../../../../../../packages/generator/src/history/headCheck.ts#L117)

##### `ReplayedMoment` — Summary
A moment of the history, as replayed: its shape and its rows.

#### `headDifferences` {#symbol-headdifferences}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/headCheck.ts#L127)
- Parameters: `replayed`: [`ReplayedMoment`](#symbol-replayedmoment); `committed`: [`LiveDocGraph`](../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph)

##### `headDifferences` — Summary
Where a replayed moment differs from a graph derived from committed Live Docs, in words.

##### `headDifferences` — Parameters
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
