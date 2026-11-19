# packages/generator/src/history/headCheck.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/generator/src/history/headCheck.ts
- Generated At: 2026-11-19T08:59:55.177Z

## Authored
### Purpose
_Pending authored purpose_

### Notes
_Pending notes_

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
