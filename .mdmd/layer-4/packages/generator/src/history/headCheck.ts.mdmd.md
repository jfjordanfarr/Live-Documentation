# packages/generator/src/history/headCheck.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/generator/src/history/headCheck.ts
- Generated At: 2026-11-19T08:59:55.177Z

## Authored
### Purpose
The check at the head: the history's last step, replayed through every step from its base, compared field by field with the graph read afresh from the Live Docs committed at the commit the history ends at, so that a fault anywhere between the generator and the replay shows as a named difference.

### Notes
- Written 2026-11-19 after [the independent review](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Probes/history-data-review/README.md) found that the rows' side of the check ran the committed graph through the same `summarizeGraph` and `rowsOfSummary` that made the summaries, so a fault in them would have been found on both sides alike. The committed side is now read here from the doc reader's model: each symbol's heading, anchor, kind, flags, type names and description's sections, each dependency line's label and qualifiers, the entries, re-exported anchors, citing documents and authored block, and the links from the graph's resolved edges. Texts are compared by their words, never by the hash or id they are stored under.
- What the two sides share is the doc reader (`readLiveDocGraph`) and the meaning of the fields compared.
- When the check applies is `computeHistory.ts`'s rule, `HEAD_CHECK_RULE`: when asked with `--check-head`, or when the generator runs unmodified from the head under the workspace's own configuration.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ReplayedMoment` {#symbol-replayedmoment}
- Type: interface
- Source: [source](../../../../../../packages/generator/src/history/headCheck.ts#L31)

##### `ReplayedMoment` — Summary
A moment of the history, as replayed: its shape and its rows.

#### `headDifferences` {#symbol-headdifferences}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/headCheck.ts#L41)
- Parameters: `replayed`: [`ReplayedMoment`](#symbol-replayedmoment); `committed`: [`LiveDocGraph`](../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph)

##### `headDifferences` — Summary
Where a replayed moment differs from a graph derived from committed Live Docs, in words.

##### `headDifferences` — Parameters
- `textOf`: The text the replayed rows name by an id.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`graph.GraphFile`](../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-graphfile)
- [`graph.LiveDocGraph`](../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph)
- [`graph.linkTarget`](../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-linktarget-function)
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
